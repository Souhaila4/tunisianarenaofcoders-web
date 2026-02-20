"use client";

import Link from "next/link";
import PlatformNavbar from "../components/PlatformNavbar";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { translations } from "../lib/translations";

const TOP_3 = [
  { rank: 1, name: "Sarah J.", role: "Fullstack Developer", xp: "2,890", initials: "SJ", place: "first", badgeColor: "bg-amber-500", borderColor: "border-amber-400" },
  { rank: 2, name: "Alex M.", role: "Backend Engineer", xp: "2,450", initials: "AM", place: "second", badgeColor: "bg-slate-400", borderColor: "border-slate-300" },
  { rank: 3, name: "David K.", role: "DevOps Specialist", xp: "2,310", initials: "DK", place: "third", badgeColor: "bg-amber-700", borderColor: "border-amber-600" },
];

const RANKING_DATA = [
  { rank: 4, name: "CodeNinja_99", role: "Fullstack Developer", xp: "2,100", trend: 2, initials: "CN", color: "from-violet-500 to-purple-600" },
  { rank: 5, name: "BitMaster", role: "Security Engineer", xp: "2,050", trend: -1, initials: "BM", color: "from-emerald-500 to-green-600" },
  { rank: 14, name: "@dev_master", role: "UI Designer", xp: "1,850", trend: 5, initials: "DM", color: "from-cyan-400 to-blue-600", isUser: true },
  { rank: 15, name: "ScriptKiddie", role: "Frontend Developer", xp: "1,800", trend: 0, initials: "SK", color: "from-orange-500 to-amber-600" },
  { rank: 16, name: "ByteBoss", role: "Cloud Architect", xp: "1,750", trend: 3, initials: "BB", color: "from-blue-600 to-indigo-600" },
];

export default function ClassementsPage() {
  const { lang } = useAccessibility();
  const t = translations[lang];

  return (
    <div className="min-h-screen text-white font-sans relative">
      <PlatformNavbar />

      <main className="max-w-5xl mx-auto px-6 md:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{t.ranking.weekly}</h1>
          <p className="mt-2 text-white/60 text-sm flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            {t.ranking.subtitle}
          </p>
        </div>

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-4 md:gap-8 mb-16">
          {TOP_3.map((coder) => (
            <div
              key={coder.rank}
              className={`flex flex-col items-center ${
                coder.place === "first" ? "order-2 -mt-4" : coder.place === "second" ? "order-1" : "order-3"
              }`}
            >
              <div className={`relative ${coder.place === "first" ? "scale-110" : "scale-95"}`}>
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xl font-bold text-black border-2 ${coder.borderColor}`}>
                  {coder.initials}
                </div>
                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full ${coder.badgeColor} text-white text-[10px] font-bold whitespace-nowrap`}>
                  {coder.place === "first" ? t.ranking.firstPlace : coder.place === "second" ? t.ranking.secondPlace : t.ranking.thirdPlace}
                </div>
              </div>
              <p className="mt-4 text-cyan-400 font-semibold">{coder.name}</p>
              <p className="text-sm text-white/70">{coder.xp} XP</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">{t.ranking.rank}</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">{t.ranking.coder}</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">{t.ranking.experience}</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">{t.ranking.trend}</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">{t.ranking.actions}</th>
                </tr>
              </thead>
              <tbody>
                {RANKING_DATA.slice(0, 2).map((row) => (
                  <tr key={row.rank} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4 px-4 text-sm font-bold text-white/80">#{String(row.rank).padStart(2, "0")}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${row.color} flex items-center justify-center text-sm font-bold`}>
                          {row.initials}
                        </div>
                        <div>
                          <p className="font-medium">{row.name}</p>
                          <p className="text-xs text-white/50">{row.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-cyan-400 font-semibold">{row.xp} XP</td>
                    <td className="py-4 px-4">
                      <span className={row.trend > 0 ? "text-emerald-400" : row.trend < 0 ? "text-red-400" : "text-white/50"}>
                        {row.trend > 0 ? "↑" : row.trend < 0 ? "↓" : ""} {row.trend > 0 ? `+${row.trend}%` : row.trend < 0 ? `${row.trend}%` : "0%"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button type="button" className="p-2 rounded-lg text-white/60 hover:bg-white/10" aria-label="Menu">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="text-center py-2">
                  <td colSpan={5} className="text-white/30 text-sm">...</td>
                </tr>
                {RANKING_DATA.slice(2).map((row) => (
                  <tr
                    key={row.rank}
                    className={`border-b border-white/5 ${row.isUser ? "bg-cyan-500/10 border-l-4 border-l-cyan-500" : "hover:bg-white/5"}`}
                  >
                    <td className="py-4 px-4 text-sm font-bold text-white/80">#{String(row.rank).padStart(2, "0")}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${row.color} flex items-center justify-center text-sm font-bold`}>
                          {row.initials}
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {row.name}
                            {row.isUser && (
                              <span className="px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-400 text-[10px] font-semibold">
                                {t.ranking.you}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-white/50">{row.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-cyan-400 font-semibold">{row.xp} XP</td>
                    <td className="py-4 px-4">
                      <span className={row.trend > 0 ? "text-emerald-400" : row.trend < 0 ? "text-red-400" : "text-white/50"}>
                        {row.trend > 0 ? "↑" : row.trend < 0 ? "↓" : ""} {row.trend > 0 ? `+${row.trend}%` : row.trend < 0 ? `${row.trend}%` : "0%"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {row.isUser ? (
                        <Link
                          href="/profile"
                          className="inline-block px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold text-xs uppercase hover:bg-cyan-400 transition-colors"
                        >
                          {t.ranking.viewStats}
                        </Link>
                      ) : (
                        <button type="button" className="p-2 rounded-lg text-white/60 hover:bg-white/10" aria-label="Menu">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 border-t border-white/10">
            <p className="text-sm text-white/50">
              {t.ranking.showing} 1,492 {t.ranking.coders}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" className="p-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/10 disabled:opacity-50" aria-label="Page précédente">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button type="button" className="w-10 h-10 rounded-lg bg-cyan-500 text-black font-bold text-sm">1</button>
              <button type="button" className="w-10 h-10 rounded-lg border border-white/20 text-white font-medium text-sm hover:bg-white/10">2</button>
              <button type="button" className="w-10 h-10 rounded-lg border border-white/20 text-white font-medium text-sm hover:bg-white/10">3</button>
              <button type="button" className="p-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/10" aria-label="Page suivante">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
