import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRole, type Specialty, type Prisma } from '@prisma/client';
import {
  CompetitionStatus,
  CompetitionDifficulty,
  ParticipantStatus,
  VALID_STATUS_TRANSITIONS,
} from './competition-status.enum';
import {
  CreateCompetitionDto,
  UpdateCompetitionDto,
  ChangeCompetitionStatusDto,
  CompetitionQueryDto,
} from './competition.dto';

@Injectable()
export class CompetitionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // ADMIN METHODS
  // ─────────────────────────────────────────────────────────────────

  async createCompetition(
    createDto: CreateCompetitionDto,
    adminUserId: string,
  ) {
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);
    const now = new Date();

    if (startDate <= now) {
      throw new BadRequestException('startDate must be in the future');
    }
    if (endDate <= startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }

    const createData = {
      title: createDto.title,
      description: createDto.description,
      difficulty: createDto.difficulty,
      specialty: createDto.specialty ?? null,
      startDate,
      endDate,
      rewardPool: createDto.rewardPool ?? 0,
      maxParticipants: createDto.maxParticipants ?? null,
      createdBy: adminUserId,
    };

    const competition = await this.prisma.competition.create({
      data: createData as Prisma.CompetitionUncheckedCreateInput,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: { select: { participants: true } },
      },
    });

    const created = competition as typeof competition & {
      specialty?: Specialty | null;
    };
    this.emitEvent('competition.created', {
      competitionId: created.id,
      title: created.title,
      createdBy: adminUserId,
      specialty: created.specialty ?? undefined,
    });

    // Notify users whose mainSpecialty matches this competition's specialty
    if (created.specialty) {
      void this.notifyUsersMatchingSpecialty({
        id: created.id,
        title: created.title,
        specialty: created.specialty,
      }).catch((err) =>
        console.error('Failed to notify users for new hackathon:', err),
      );
    }

    return competition;
  }

  /**
   * Create in-app notifications and send emails to users whose mainSpecialty
   * matches the competition's specialty.
   */
  private async notifyUsersMatchingSpecialty(competition: {
    id: string;
    title: string;
    specialty: Specialty | null;
  }) {
    if (!competition.specialty) return;

    const users = await this.prisma.user.findMany({
      where: {
        role: UserRole.USER,
        mainSpecialty: competition.specialty,
        isBanned: false,
      },
      select: { id: true, email: true, firstName: true },
    });

    const title = `New hackathon for ${competition.specialty}: ${competition.title}`;
    const body = `A new ${competition.specialty} hackathon is open. Check it out and join if you're interested!`;

    for (const user of users) {
      await (this.prisma as any).notification.create({
        data: {
          userId: user.id,
          type: 'HACKATHON_MATCH',
          title,
          body,
          competitionId: competition.id,
        },
      });
      await this.emailService.sendHackathonNotification(
        user.email,
        user.firstName,
        competition.title,
        competition.specialty,
      );
    }
  }

  async updateCompetition(
    competitionId: string,
    updateDto: UpdateCompetitionDto,
    _adminUserId: string,
  ) {
    const competition = await this.findCompetitionById(competitionId);

    const lockedStatuses: CompetitionStatus[] = [
      CompetitionStatus.RUNNING,
      CompetitionStatus.SUBMISSION_CLOSED,
      CompetitionStatus.EVALUATING,
      CompetitionStatus.COMPLETED,
    ];

    if (lockedStatuses.includes(competition.status as CompetitionStatus)) {
      throw new BadRequestException(
        'Cannot update a competition that is running or already completed',
      );
    }

    if (updateDto.startDate || updateDto.endDate) {
      const startDate = new Date(
        updateDto.startDate ?? competition.startDate,
      );
      const endDate = new Date(updateDto.endDate ?? competition.endDate);
      const now = new Date();

      if (updateDto.startDate && startDate <= now) {
        throw new BadRequestException('New startDate must be in the future');
      }
      if (endDate <= startDate) {
        throw new BadRequestException('endDate must be after startDate');
      }
    }

    const updateData = {
      ...updateDto,
      specialty:
        updateDto.specialty !== undefined ? updateDto.specialty : undefined,
      startDate: updateDto.startDate
        ? new Date(updateDto.startDate)
        : undefined,
      endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
    };
    const updated = await this.prisma.competition.update({
      where: { id: competitionId },
      data: updateData as Prisma.CompetitionUncheckedUpdateInput,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: { select: { participants: true } },
      },
    });

    return updated;
  }

  async changeCompetitionStatus(
    competitionId: string,
    changeStatusDto: ChangeCompetitionStatusDto,
    _adminUserId: string,
  ) {
    const competition = await this.findCompetitionById(competitionId);
    const currentStatus = competition.status as CompetitionStatus;
    const newStatus = changeStatusDto.status;

    if (!this.isValidStatusTransition(currentStatus, newStatus)) {
      throw new BadRequestException(
        `Invalid status transition: ${currentStatus} → ${newStatus}. ` +
          `Allowed next status(es): [${VALID_STATUS_TRANSITIONS[currentStatus].join(', ')}]`,
      );
    }

    const updated = await this.prisma.competition.update({
      where: { id: competitionId },
      data: { status: newStatus },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: { select: { participants: true } },
      },
    });

    this.emitEvent('competition.status_changed', {
      competitionId,
      oldStatus: currentStatus,
      newStatus,
    });

    if (newStatus === CompetitionStatus.RUNNING) {
      this.emitEvent('competition.started', {
        competitionId,
        title: competition.title,
      });
    }

    if (newStatus === CompetitionStatus.COMPLETED) {
      this.emitEvent('competition.completed', {
        competitionId,
        title: competition.title,
      });
    }

    return updated;
  }

  async archiveCompetition(competitionId: string) {
    const competition = await this.findCompetitionById(competitionId);

    if (competition.status !== CompetitionStatus.COMPLETED) {
      throw new BadRequestException(
        'Only COMPLETED competitions can be archived',
      );
    }

    return this.prisma.competition.update({
      where: { id: competitionId },
      data: { status: CompetitionStatus.ARCHIVED, isActive: false },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: { select: { participants: true } },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // TALENT METHODS
  // ─────────────────────────────────────────────────────────────────

  async joinCompetition(competitionId: string, userId: string) {
    const competition = await this.findCompetitionById(competitionId);

    if (competition.status !== CompetitionStatus.OPEN_FOR_ENTRY) {
      throw new BadRequestException(
        `This competition is not open for entry. Current status: ${competition.status}`,
      );
    }

    // Check duplicate
    const existingParticipation =
      await this.prisma.competitionParticipant.findUnique({
        where: {
          competitionId_userId: { competitionId, userId },
        },
      });

    if (existingParticipation) {
      throw new ConflictException('You have already joined this competition');
    }

    // Check capacity
    if (competition.maxParticipants !== null) {
      const currentCount = await this.prisma.competitionParticipant.count({
        where: { competitionId, status: ParticipantStatus.JOINED },
      });

      if (currentCount >= competition.maxParticipants) {
        throw new BadRequestException(
          'This competition has reached its maximum participant limit',
        );
      }
    }

    const participation = await this.prisma.competitionParticipant.create({
      data: {
        competitionId,
        userId,
        status: ParticipantStatus.JOINED,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mainSpecialty: true,
          },
        },
        competition: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    this.emitEvent('competition.user_joined', {
      competitionId,
      userId,
      competitionTitle: competition.title,
    });

    return participation;
  }

  // ─────────────────────────────────────────────────────────────────
  // LEADERBOARD
  // ─────────────────────────────────────────────────────────────────

  async getLeaderboard(competitionId: string) {
    await this.findCompetitionById(competitionId); // 404 guard

    const participants = await this.prisma.competitionParticipant.findMany({
      where: { competitionId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            mainSpecialty: true,
            totalChallenges: true,
            totalWins: true,
          },
        },
      },
      orderBy: [
        // Ranks SUBMITTED above JOINED, DISQUALIFIED at the bottom
        { status: 'asc' },
        { joinedAt: 'asc' },
      ],
    });

    return {
      competitionId,
      totalParticipants: participants.length,
      leaderboard: participants.map((p, index) => ({
        rank: index + 1,
        participantId: p.id,
        status: p.status,
        joinedAt: p.joinedAt,
        user: p.user,
      })),
    };
  }

  async getGlobalLeaderboard(limit = 20) {
    const users = await this.prisma.user.findMany({
      where: { isBanned: false, role: UserRole.USER },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        mainSpecialty: true,
        totalChallenges: true,
        totalWins: true,
      },
      orderBy: [{ totalWins: 'desc' }, { totalChallenges: 'desc' }],
      take: limit,
    });

    return {
      totalUsers: users.length,
      leaderboard: users.map((u, index) => ({
        rank: index + 1,
        ...u,
        winRate:
          u.totalChallenges > 0
            ? Math.round((u.totalWins / u.totalChallenges) * 100)
            : 0,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // SHARED / READ METHODS
  // ─────────────────────────────────────────────────────────────────

  async findAllCompetitions(queryDto: CompetitionQueryDto) {
    const {
      status,
      difficulty,
      specialty,
      onlyActive,
      page = 1,
      limit = 10,
    } = queryDto;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (difficulty) where.difficulty = difficulty;
    if (specialty) where.specialty = specialty;
    if (onlyActive !== undefined) where.isActive = onlyActive;

    const [competitions, totalCount] = await Promise.all([
      this.prisma.competition.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: { select: { participants: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.competition.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: competitions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * List competitions relevant to the current user:
   * - If user has mainSpecialty set, returns competitions whose specialty matches
   *   (plus those with no specialty).
   * - If user has no mainSpecialty, returns all competitions.
   */
  async findCompetitionsForUser(userId: string, queryDto: CompetitionQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { mainSpecialty: true },
    });

    const {
      status,
      difficulty,
      specialty,
      onlyActive,
      page = 1,
      limit = 10,
    } = queryDto;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (difficulty) where.difficulty = difficulty;
    if (specialty) where.specialty = specialty;
    if (onlyActive !== undefined) where.isActive = onlyActive;

    // Filter by user's specialty: show matching specialty OR no specialty set on competition
    if (user?.mainSpecialty && !specialty) {
      where.OR = [{ specialty: user.mainSpecialty }, { specialty: null }];
    }

    const [competitions, totalCount] = await Promise.all([
      this.prisma.competition.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: { select: { participants: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.competition.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: competitions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findCompetitionById(competitionId: string) {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: { select: { participants: true } },
      },
    });

    if (!competition) {
      throw new NotFoundException(
        `Competition with id "${competitionId}" not found`,
      );
    }

    return competition;
  }

  async getCompetitionParticipants(competitionId: string) {
    await this.findCompetitionById(competitionId); // 404 guard

    const participants = await this.prisma.competitionParticipant.findMany({
      where: { competitionId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mainSpecialty: true,
            totalChallenges: true,
            totalWins: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return {
      competitionId,
      totalParticipants: participants.length,
      participants,
    };
  }

  async getMyParticipation(competitionId: string, userId: string) {
    await this.findCompetitionById(competitionId); // 404 guard

    const participation =
      await this.prisma.competitionParticipant.findUnique({
        where: {
          competitionId_userId: { competitionId, userId },
        },
        include: {
          competition: {
            select: {
              id: true,
              title: true,
              status: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      });

    if (!participation) {
      throw new NotFoundException(
        'You are not registered in this competition',
      );
    }

    return participation;
  }

  // ─────────────────────────────────────────────────────────────────
  // CRON — AUTOMATIC STATUS TRANSITIONS
  // ─────────────────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCompetitionStatusUpdates() {
    console.log('🔄 [CRON] Checking competition statuses...');
    const now = new Date();

    try {
      // OPEN_FOR_ENTRY → RUNNING  (when startDate has passed)
      const toStart = await this.prisma.competition.findMany({
        where: {
          status: CompetitionStatus.OPEN_FOR_ENTRY,
          startDate: { lte: now },
          isActive: true,
        },
      });

      for (const c of toStart) {
        await this.prisma.competition.update({
          where: { id: c.id },
          data: { status: CompetitionStatus.RUNNING },
        });
        console.log(`✅ [CRON] "${c.title}" → RUNNING`);
        this.emitEvent('competition.started', {
          competitionId: c.id,
          title: c.title,
        });
      }

      // RUNNING → SUBMISSION_CLOSED  (when endDate has passed)
      const toClose = await this.prisma.competition.findMany({
        where: {
          status: CompetitionStatus.RUNNING,
          endDate: { lte: now },
          isActive: true,
        },
      });

      for (const c of toClose) {
        await this.prisma.competition.update({
          where: { id: c.id },
          data: { status: CompetitionStatus.SUBMISSION_CLOSED },
        });
        console.log(`✅ [CRON] "${c.title}" → SUBMISSION_CLOSED`);
        this.emitEvent('competition.submission_closed', {
          competitionId: c.id,
          title: c.title,
        });
      }
    } catch (error) {
      console.error('❌ [CRON] Error updating competition statuses:', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────

  private isValidStatusTransition(
    currentStatus: CompetitionStatus,
    newStatus: CompetitionStatus,
  ): boolean {
    return (
      VALID_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false
    );
  }

  private emitEvent(eventName: string, data: Record<string, unknown>) {
    console.log(`🎯 [EVENT] ${eventName}:`, JSON.stringify(data));
  }
}
