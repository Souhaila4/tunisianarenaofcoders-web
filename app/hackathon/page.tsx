"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PlatformNavbar from "../components/PlatformNavbar";
import { getHackathonRooms, getCompetitions, joinCompetition, type Competition } from "../lib/api";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { translations } from "../lib/translations";

type Room = { id: string; name: string; description: string; specialty?: string; canParticipate: boolean };

/** Images thématiques par spécialité (Unsplash) */
const ROOM_IMAGES: Record<string, string> = {
  FRONTEND:
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop",
  BACKEND:
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop",
  FULLSTACK:
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop",
};
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=200&fit=crop";

const FILTERS = ["all", "frontend", "backend", "fullstack"] as const;

export default function HackathonPage() {
  const { lang } = useAccessibility();
  const t = translations[lang].hackathon ?? translations.fr.hackathon;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // ── Competitions ──
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [compLoading, setCompLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinMsg, setJoinMsg] = useState<Record<string, string>>({});

  useEffect(() => {
    getHackathonRooms()
      .then((data) => setRooms(data.rooms ?? []))
      .catch((err) => setError(err?.message ?? "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getCompetitions({ onlyActive: true, limit: 20 })
      .then((res) => setCompetitions(res.data ?? []))
      .catch(() => setCompetitions([]))
      .finally(() => setCompLoading(false));
  }, []);

  const handleJoin = async (id: string) => {
    setJoiningId(id);
    try {
      await joinCompetition(id);
      setJoinMsg((m) => ({ ...m, [id]: "Inscription réussie ✅" }));
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Erreur";
      setJoinMsg((m) => ({ ...m, [id]: msg }));
    } finally {
      setJoiningId(null);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchSearch =
      !search.trim() ||
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      (room.description || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === "all" ||
      (room.specialty && room.specialty.toLowerCase() === activeFilter);
    return matchSearch && matchFilter;
  });

  const specialtyLabel = (s?: string) => {
    if (!s) return s;
    const k = s.toLowerCase() as "frontend" | "backend" | "fullstack";
    return t.filters[k] ?? s;
  };

  return (
    <div className="min-h-screen text-white font-sans relative">
      <PlatformNavbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Live Banner */}
        <p className="text-cyan-400 text-sm mb-4">{t.liveBanner}</p>

        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t.title}
            <span className="text-cyan-400">{t.titleHighlight}</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl">{t.tagline}</p>
          <p className="text-white/50 text-sm mt-2">
            <span className="text-cyan-400">{t.taglineHint}</span>
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="search"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 outline-none focus:border-cyan-500/50"
            />
            <button
              type="button"
              className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors shrink-0"
            >
              {t.searchBtn}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === f
                    ? "bg-cyan-500 text-black"
                    : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                }`}
              >
                {t.filters[f]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Competitions section ── */}
        {!compLoading && competitions.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 text-base">🏆</span>
              Hackathons en cours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {competitions.map((comp) => (
                <CompetitionCard
                  key={comp.id}
                  competition={comp}
                  rooms={rooms}
                  joining={joiningId === comp.id}
                  joinMsg={joinMsg[comp.id]}
                  onJoin={() => handleJoin(comp.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Rooms Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg
                className="w-5 h-5 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {t.activeRooms}
            </h2>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span>{t.sortBy}</span>
              <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500/50">
                <option>{t.mostRecent}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[200px] gap-3">
              <span
                className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRooms.map((room) => {
                const thumbSrc =
                  (room.specialty && ROOM_IMAGES[room.specialty]) || DEFAULT_IMAGE;
                const canJoin = room.canParticipate;

                return canJoin ? (
                  <Link
                    key={room.id}
                    href={`/hackathon/${room.id}`}
                    className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-cyan-500/30 transition-colors flex flex-col"
                  >
                    <div className="h-32 relative overflow-hidden">
                      <Image
                        src={thumbSrc}
                        alt={room.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/30 text-cyan-300">
                          {specialtyLabel(room.specialty)}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">
                        {room.name}
                      </h3>
                      <p className="text-sm text-white/60 line-clamp-2 mb-4">
                        {room.description}
                      </p>
                      <div className="mt-auto">
                        <span className="inline-flex items-center gap-2 text-cyan-400 font-bold text-sm mb-3">
                          {t.taglineHint}
                        </span>
                        <span className="block w-full py-3 rounded-xl bg-cyan-500 text-black font-bold text-center hover:bg-cyan-400 transition-colors">
                          {t.joinRoom}
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div
                    key={room.id}
                    className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex flex-col opacity-80 cursor-not-allowed"
                  >
                    <div className="h-32 relative overflow-hidden">
                      <Image
                        src={thumbSrc}
                        alt={room.name}
                        fill
                        className="object-cover grayscale"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/50" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/30 text-amber-300">
                          {specialtyLabel(room.specialty)}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">
                        {room.name}
                      </h3>
                      <p className="text-sm text-white/60 line-clamp-2 mb-4">
                        {room.description}
                      </p>
                      <p className="text-sm text-amber-400 mt-auto">
                        {t.reservedAccess} — {specialtyLabel(room.specialty)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && filteredRooms.length > 0 && (
            <div className="mt-10 flex flex-col items-center gap-4">
              <p className="text-sm text-white/50">
                {t.showing} {filteredRooms.length} {t.of} {rooms.length} {t.rooms}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CompetitionCard
// ─────────────────────────────────────────────────────────────────
const COMP_SPECIALTY_IMAGES: Record<string, string> = {
  FRONTEND: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop",
  BACKEND: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop",
  FULLSTACK: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop",
  MOBILE: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop",
  DATA: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
  DEVOPS: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=200&fit=crop",
  CYBERSECURITY: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&h=200&fit=crop",
  DESIGN: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop",
  BI: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?w=400&h=200&fit=crop",
};
const DIFF_BADGE: Record<string, string> = {
  EASY: "bg-emerald-500/20 text-emerald-300",
  MEDIUM: "bg-amber-500/20 text-amber-300",
  HARD: "bg-red-500/20 text-red-300",
};
const STATUS_BADGE: Record<string, string> = {
  OPEN_FOR_ENTRY: "bg-emerald-500/25 text-emerald-300",
  RUNNING: "bg-cyan-500/25 text-cyan-300",
};
const STATUS_LABEL: Record<string, string> = {
  OPEN_FOR_ENTRY: "Inscriptions ouvertes",
  RUNNING: "En cours 🔥",
};

function CompetitionCard({
  competition: c,
  rooms,
  joining,
  joinMsg,
  onJoin,
}: {
  competition: Competition;
  rooms: Room[];
  joining: boolean;
  joinMsg?: string;
  onJoin: () => void;
}) {
  const img = (c.specialty && COMP_SPECIALTY_IMAGES[c.specialty]) || DEFAULT_IMAGE;
  const isAlreadyJoined = joinMsg?.includes("✅");

  // Find matching room for this competition's specialty
  const roomId = c.specialty ? `room-${c.specialty}` : null;
  const matchingRoom = roomId ? rooms.find((r) => r.id === roomId) : null;
  const canJoinRoom = matchingRoom?.canParticipate ?? false;

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-white/5 overflow-hidden flex flex-col hover:border-amber-500/40 transition-colors">
      <div className="h-32 relative overflow-hidden">
        <Image src={img} alt={c.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {c.specialty && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/30 text-indigo-300">
              {c.specialty}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_BADGE[c.status] ?? "bg-white/20 text-white"}`}>
            {STATUS_LABEL[c.status] ?? c.status}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${DIFF_BADGE[c.difficulty] ?? "bg-white/10 text-white"}`}>
            {c.difficulty}
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1 gap-2">
        <h3 className="font-bold text-lg line-clamp-2 text-white">{c.title}</h3>
        <p className="text-sm text-white/60 line-clamp-3 flex-1">{c.description}</p>
        <div className="flex flex-wrap gap-3 text-xs text-white/50 mt-1">
          <span>📅 {new Date(c.startDate).toLocaleDateString("fr-FR")} → {new Date(c.endDate).toLocaleDateString("fr-FR")}</span>
          {c.rewardPool > 0 && <span>🏆 Récompense : {c.rewardPool.toLocaleString()}</span>}
          {c.maxParticipants && <span>👥 Max : {c.maxParticipants}</span>}
          <span>👥 {c._count?.participants ?? 0} inscrit{(c._count?.participants ?? 0) !== 1 ? "s" : ""}</span>
        </div>
        {joinMsg && (
          <p className={`text-xs font-medium ${isAlreadyJoined ? "text-emerald-400" : "text-red-400"}`}>{joinMsg}</p>
        )}

        {/* ── OPEN_FOR_ENTRY: inscription button ── */}
        {c.status === "OPEN_FOR_ENTRY" && !isAlreadyJoined && (
          <button
            type="button"
            onClick={onJoin}
            disabled={joining}
            className="mt-1 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {joining ? (
              <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Inscription…</>
            ) : "S'inscrire au hackathon"}
          </button>
        )}
        {c.status === "OPEN_FOR_ENTRY" && isAlreadyJoined && (
          <div className="mt-1 w-full py-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 font-semibold text-sm text-center">
            ✅ Inscrit — la salle s&apos;ouvrira au démarrage
          </div>
        )}

        {/* ── RUNNING: join the room ── */}
        {c.status === "RUNNING" && roomId && (
          canJoinRoom ? (
            <Link
              href={`/hackathon/${roomId}`}
              className="mt-1 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Rejoindre la salle {c.specialty}
            </Link>
          ) : (
            <div className="mt-1 w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/40 font-semibold text-sm text-center flex items-center justify-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Réservé spécialité {c.specialty}
            </div>
          )
        )}
        {c.status === "RUNNING" && !roomId && (
          <div className="mt-1 w-full py-2.5 rounded-xl border border-cyan-500/30 text-cyan-400 font-bold text-sm text-center">
            Compétition en cours
          </div>
        )}
      </div>
    </div>
  );
}
