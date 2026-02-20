"use client";

import { useEffect, useState } from "react";
import { getProfile } from "../lib/api";
import Link from "next/link";
import PlatformNavbar from "../components/PlatformNavbar";

export default function ProfilePage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode] = useState(true);

  useEffect(() => {
    let mounted = true;
    getProfile()
      .then((u) => { if (mounted) setUser(u); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white relative">
        <p>Erreur de chargement du profil. <Link href="/signin" className="text-cyan-400 underline">Se connecter</Link></p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans relative ${isDarkMode ? "text-white" : "bg-gray-50 text-slate-900"}`}>
      <PlatformNavbar />

      {/* Contenu profil — grille type maquette */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte 1 : Résumé profil (avatar, nom, rang, niveau, XP, Modifier le profil) */}
          <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-lg"}`}>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl font-bold text-black">
                  {user?.firstName?.[0] || "?"}{user?.lastName?.[0] || ""}
                </div>
                <span className="absolute bottom-0 right-0 flex h-5 w-5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-cyan-500 border-2 border-[#0a0f1e]" />
                </span>
              </div>
              <h1 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h1>
              <p className="text-sm text-cyan-500 font-semibold uppercase tracking-wider mt-1">{user?.mainSpecialty || "Développeur"}</p>
              <div className="flex gap-3 mt-4 w-full justify-center flex-wrap">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isDarkMode ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-700"}`}>
                  RANG MONDIAL #{(user as any)?.globalRank ?? "1,204"}
                </span>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isDarkMode ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"}`}>
                  NIVEAU {(user as any)?.level ?? "1"}
                </span>
              </div>
              <div className="w-full mt-4 text-left">
                <p className="text-xs text-white/60 mb-1">Expérience (XP)</p>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${Math.min(100, (((user as any)?.xp ?? 12450) / 15000) * 100)}%` }} />
                </div>
                <p className="text-xs text-white/50 mt-1">{((user as any)?.xp ?? 12450).toLocaleString()} / 15,000</p>
              </div>
              <Link
                href="/settings"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-black font-semibold text-sm hover:bg-cyan-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 5.232z" /></svg>
                Modifier le profil
              </Link>
            </div>
          </div>

          {/* Carte 2 : Radar d'expertise */}
          <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-lg"}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold">Radar d&apos;Expertise</h2>
                <p className="text-xs text-white/50 mt-0.5">Visualisation des compétences techniques</p>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-500/20 text-cyan-400">Top 1% Global</span>
            </div>
            <div className="flex justify-center">
              <RadarChart values={[85, 90, 60, 70, 65, 45]} labels={["FRONTEND", "BACK", "SECUI", "DEVOPS", "U/ML", "MOBILE"]} />
            </div>
          </div>

          {/* Carte 3 : Preuve de compétence */}
          <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-lg"}`}>
            <div className="mb-4">
              <h2 className="text-lg font-bold">Preuve de Compétence</h2>
              <p className="text-xs text-white/50 mt-0.5">Métriques de performance brute</p>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-black">94</span>
              <span className="text-2xl font-bold text-white/60">/100</span>
            </div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mb-4">
              <span>↑</span> +2% ce mois — Score d&apos;efficience globale
            </p>
            <div className="space-y-3">
              {[
                { label: "Algorithmique & Structures", value: 98 },
                { label: "Qualité du Code (Clean Code)", value: 92 },
                { label: "Résolution de Problèmes", value: 89 },
                { label: "Vitesse d'Exécution", value: 95 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-white/70">{item.label}</span>
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-cyan-500" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carte 4 : Classement mondial */}
          <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-lg"}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Classement mondial
              </h2>
              <Link href="/classements" className="text-xs font-semibold text-cyan-400 hover:underline">Voir le classement complet →</Link>
            </div>
            <ul className="space-y-2">
              {[
                { rank: 40, name: "Sarah Jenkins", score: "28.4k" },
                { rank: 41, name: "Liam Vogt", score: "28.1k" },
                { rank: 42, name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Vous", score: "27.9k", highlight: true },
                { rank: 43, name: "Elena Rose", score: "27.6k" },
              ].map((row) => (
                <li
                  key={row.rank}
                  className={`flex items-center gap-4 py-2 px-3 rounded-xl ${row.highlight ? "bg-cyan-500/20 border border-cyan-500/40" : isDarkMode ? "bg-white/5" : "bg-slate-50"}`}
                >
                  <span className="w-8 text-sm font-bold text-white/70">#{row.rank}</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/50 to-blue-500/50 flex items-center justify-center text-xs font-bold">
                    {row.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <span className="flex-1 font-medium">{row.name}</span>
                  <span className="text-sm font-bold text-cyan-400">{row.score}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Carte 5 : Badges obtenus */}
          <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-lg"}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Badges obtenus</h2>
              <button type="button" className="text-xs font-semibold text-cyan-400 hover:underline">Voir tout</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[
                { icon: "✓", title: "Mentor Certifié", sub: "Niveau 3", color: "cyan" },
                { icon: "🚀", title: "Speed Demon", sub: "Top 50 Speed", color: "cyan" },
                { icon: "⚙", title: "Code Architect", sub: "Design Patterns", color: "cyan" },
                { icon: "🐛", title: "Bug Hunter", sub: "100+ Fixes", color: "violet" },
                { icon: "🔒", title: "Prochain Badge", sub: "Bloqué", locked: true },
              ].map((badge) => (
                <div
                  key={badge.title}
                  className={`flex-shrink-0 w-32 rounded-xl border p-4 text-center ${badge.locked ? "border-white/20 bg-white/5 opacity-60" : isDarkMode ? "bg-cyan-500/10 border-cyan-500/30" : "bg-cyan-50 border-cyan-200"}`}
                >
                  <span className="text-2xl mb-2 block">{badge.icon}</span>
                  <p className="text-xs font-bold truncate">{badge.title}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">{badge.sub}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-1 mt-2">
              <button type="button" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10">−</button>
              <button type="button" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10">+</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function RadarChart({ values, labels }: { values: number[]; labels: string[] }) {
  const size = 160;
  const center = size / 2;
  const maxR = center - 20;
  const n = values.length;
  const points = values.map((v, i) => {
    const angle = (i * 360 / n - 90) * (Math.PI / 180);
    const r = (v / 100) * maxR;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  });
  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z";
  const axisPoints = labels.map((_, i) => {
    const angle = (i * 360 / n - 90) * (Math.PI / 180);
    return [center + maxR * Math.cos(angle), center + maxR * Math.sin(angle)];
  });
  return (
    <svg width={size} height={size} className="overflow-visible">
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          key={scale}
          points={axisPoints.map((p) => `${center + (p[0] - center) * scale},${center + (p[1] - center) * scale}`).join(" ")}
          fill="none"
          stroke="rgba(14, 230, 255, 0.2)"
          strokeWidth="1"
        />
      ))}
      {axisPoints.map((p, i) => (
        <line key={i} x1={center} y1={center} x2={p[0]} y2={p[1]} stroke="rgba(14, 230, 255, 0.25)" strokeWidth="1" />
      ))}
      <path d={pathData} fill="rgba(14, 230, 255, 0.35)" stroke="rgba(14, 230, 255, 0.6)" strokeWidth="1.5" />
      {labels.map((label, i) => {
        const angle = (i * 360 / n - 90) * (Math.PI / 180);
        const x = center + (maxR + 14) * Math.cos(angle);
        const y = center + (maxR + 14) * Math.sin(angle);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" className="fill-white/70 text-[9px] font-bold" style={{ dominantBaseline: "central" }}>{label}</text>
        );
      })}
    </svg>
  );
}
