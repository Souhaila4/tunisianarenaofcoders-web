"use client";

import { useState } from "react";
import Link from "next/link";
import PlatformNavbar from "../components/PlatformNavbar";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { translations } from "../lib/translations";

const CHALLENGES = [
  { id: "1", title: "Quantum Algorithm Optimization Challenge", difficulty: "hard" as const, featured: true, prize: "5,000", timeLeft: "2H 15M", joined: "1,240", thumb: "bg-gradient-to-br from-blue-600 to-cyan-500" },
  { id: "2", title: "Zero-Trust Network Protocol Architecture", difficulty: "medium" as const, featured: false, prize: "2,500", timeLeft: "5H 40M", joined: "850", thumb: "bg-slate-800" },
  { id: "3", title: "Blockchain Consensus Mechanism Audit", difficulty: "hard" as const, featured: true, prize: "12,000", timeLeft: "1D 2H", joined: "2,100", thumb: "bg-gradient-to-br from-violet-700 to-purple-900" },
  { id: "4", title: "Real-time Dashboard with React & WebSockets", difficulty: "easy" as const, featured: false, prize: "1,000", timeLeft: "8H 13M", joined: "2,165", thumb: "bg-emerald-600/80" },
  { id: "5", title: "Autonomous Trading Agent Optimization", difficulty: "medium" as const, featured: false, prize: "8,500", timeLeft: "3D 4H", joined: "150", thumb: "bg-gradient-to-br from-amber-600 to-orange-600" },
  { id: "6", title: "Latency Reduction in Edge Computing Nodes", difficulty: "easy" as const, featured: false, prize: "500", timeLeft: "13H 45M", joined: "3,450", thumb: "bg-slate-700" },
];

const FILTERS = ["all", "react", "python", "node", "go", "solidity"] as const;

export default function ArenaPage() {
  const { lang } = useAccessibility();
  const t = translations[lang].arena;
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const diffLabel = (d: string) => d === "easy" ? t.easy : d === "medium" ? t.medium : t.hard;
  const diffClass = (d: string) => d === "easy" ? "bg-emerald-500/20 text-emerald-400" : d === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400";

  return (
    <div className="min-h-screen text-white font-sans relative">
      <PlatformNavbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Live Banner */}
        <p className="text-cyan-400 text-sm mb-4">{t.liveBanner}</p>

        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {lang === "fr" ? "ENTREZ DANS L'" : "ENTER THE "}
            <span className="text-cyan-400">{lang === "fr" ? "ARENA" : "ARENA"}</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl">{t.tagline}</p>
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
            <button type="button" className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors shrink-0">
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
                  activeFilter === f ? "bg-cyan-500 text-black" : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                }`}
              >
                {t.filters[f as keyof typeof t.filters] || f}
              </button>
            ))}
          </div>
        </div>

        {/* Active Challenges */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              {t.activeChallenges}
            </h2>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span>{t.sortBy}</span>
              <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500/50">
                <option>{t.mostPopular}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {CHALLENGES.map((ch) => (
              <div
                key={ch.id}
                className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-cyan-500/30 transition-colors flex flex-col"
              >
                <div className={`h-32 ${ch.thumb} relative flex items-center justify-center`}>
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${diffClass(ch.difficulty)}`}>
                      {diffLabel(ch.difficulty)}
                    </span>
                    {ch.featured && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/30 text-cyan-300">
                        {t.featured}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-lg mb-3 line-clamp-2">{ch.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {ch.timeLeft} {t.timeLeft}
                    </span>
                    <span>{ch.joined} {t.joined}</span>
                  </div>
                  <div className="mt-auto">
                    <p className="text-cyan-400 font-bold text-sm mb-3">
                      {t.prizePool} ${ch.prize} USD
                    </p>
                    <Link
                      href="/arena"
                      className="block w-full py-3 rounded-xl bg-cyan-500 text-black font-bold text-center hover:bg-cyan-400 transition-colors"
                    >
                      {t.joinNow}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
            >
              {t.loadMore}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </button>
            <p className="text-sm text-white/50">
              {t.showing} 6 {t.of} 124 {t.challenges}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
