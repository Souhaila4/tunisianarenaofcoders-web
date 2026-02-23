import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';

@Module({
    imports: [PrismaModule, ConfigModule, AuthModule],
    controllers: [CertificateController],
    providers: [CertificateService],
})
export class CertificateModule { }
