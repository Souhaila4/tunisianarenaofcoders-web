"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PlatformNavbar from "../components/PlatformNavbar";
import {
  getToken,
  getProfile,
  getAdminDashboardStats,
  getAdminRecentUsers,
  getAdminUsers,
  triggerN8nWebhookTest,
  type AdminUserRow,
} from "../lib/api";

const PAGE_SIZE = 20;

type Stats = {
  users: {
    total: number;
    verified: number;
    banned?: number;
    noSpecialty?: number;
    byRole: Record<string, number>;
  };
  specialties: { list: string[]; bySpecialty: Record<string, number> };
  rooms: { total: number; description: string };
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (_) {
    return iso;
  }
}

/** Transforme une erreur n8n (souvent JSON) en message lisible pour l'utilisateur. */
function formatN8nError(raw: string): string {
  try {
    const data = JSON.parse(raw) as { message?: string; hint?: string; code?: number };
    if (data.hint) {
      return data.message
        ? `${data.message} ${data.hint}`
        : data.hint;
    }
    if (typeof data.message === "string") return data.message;
  } catch {
    // pas du JSON, on affiche tel quel
  }
  return raw;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUserRow[]>([]);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersQuery, setUsersQuery] = useState("");
  const [usersResult, setUsersResult] = useState<{
    users: AdminUserRow[];
    total: number;
    limit: number;
    offset: number;
  } | null>(null);
  const [usersPage, setUsersPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [n8nLoading, setN8nLoading] = useState(false);
  const [n8nSuccess, setN8nSuccess] = useState<string | null>(null);
  const [n8nError, setN8nError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/signin");
      return;
    }
    getProfile()
      .then((profile: { role?: string }) => {
        if (profile?.role !== "ADMIN") {
          router.replace("/hackathon");
          return;
        }
        return getAdminDashboardStats();
      })
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((err) => setError(err?.message ?? "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!getToken() || loading) return;
    getAdminRecentUsers(10)
      .then(setRecentUsers)
      .catch(() => setRecentUsers([]));
  }, [loading]);

  useEffect(() => {
    if (!getToken() || loading) return;
    setLoadingUsers(true);
    getAdminUsers({
      limit: PAGE_SIZE,
      offset: usersPage * PAGE_SIZE,
      search: usersQuery || undefined,
    })
      .then(setUsersResult)
      .catch(() => setUsersResult(null))
      .finally(() => setLoadingUsers(false));
  }, [loading, usersPage, usersQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setUsersQuery(usersSearch.trim());
    setUsersPage(0);
  };

  const handleRunStartupIdeaScraper = async () => {
    setN8nLoading(true);
    setN8nSuccess(null);
    setN8nError(null);
    const timeoutMs = 120_000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const result = await triggerN8nWebhookTest(controller.signal);
      clearTimeout(timeoutId);
      if (result.success) {
        setN8nSuccess("Test event reçu. Startup Idea Scraper s'est exécuté avec succès.");
        setN8nError(null);
      } else {
        setN8nError(formatN8nError(result.message ?? "Échec du déclenchement du workflow"));
        setN8nSuccess(null);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof Error && err.name === "AbortError";
      const message = isAbort
        ? "Délai dépassé (2 min). Vérifiez que le workflow a bien reçu le test event dans n8n."
        : err instanceof Error
          ? err.message
          : "Échec du déclenchement du workflow";
      setN8nError(message);
      setN8nSuccess(null);
    } finally {
      setN8nLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center gap-4 bg-[#0a0f1a]">
        <PlatformNavbar />
        <div className="flex gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white flex flex-col bg-[#0a0f1a]">
        <PlatformNavbar />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans bg-[#0a0f1a]">
      <PlatformNavbar />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            Dashboard Admin
          </h1>
          <p className="text-white/60 mt-1">Vue d&apos;ensemble de la plateforme</p>
        </div>

        {stats && (
          <>
            {/* Stats cartes */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-white/50 text-sm font-medium">Utilisateurs total</p>
                <p className="text-3xl font-bold text-cyan-400 mt-1">{stats.users.total}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-white/50 text-sm font-medium">Emails vérifiés</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">{stats.users.verified}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-white/50 text-sm font-medium">Admins</p>
                <p className="text-3xl font-bold text-amber-400 mt-1">{stats.users.byRole?.ADMIN ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-white/50 text-sm font-medium">Bannis</p>
                <p className="text-3xl font-bold text-red-400 mt-1">{stats.users.banned ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-white/50 text-sm font-medium">Sans spécialité</p>
                <p className="text-3xl font-bold text-orange-400 mt-1">{stats.users.noSpecialty ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-white/50 text-sm font-medium">Salles</p>
                <p className="text-3xl font-bold text-violet-400 mt-1">{stats.rooms.total}</p>
              </div>
            </section>

            {/* Répartition par rôle */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Utilisateurs par rôle</h2>
              <div className="flex flex-wrap gap-4">
                {stats.users.byRole &&
                  Object.entries(stats.users.byRole).map(([role, count]) => (
                    <div key={role} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-cyan-400 font-medium">{role}</span>
                      <span className="text-white/80">{count}</span>
                    </div>
                  ))}
              </div>
            </section>

            {/* Derniers inscrits */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Derniers inscrits</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/60">
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Nom</th>
                      <th className="py-3 pr-4">Rôle</th>
                      <th className="py-3 pr-4">Spécialité</th>
                      <th className="py-3 pr-4">Vérifié</th>
                      <th className="py-3">Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.length === 0 ? (
                      <tr><td colSpan={6} className="py-4 text-white/50">Aucun utilisateur</td></tr>
                    ) : (
                      recentUsers.map((u) => (
                        <tr key={u.id} className="border-b border-white/5">
                          <td className="py-3 pr-4 text-white truncate max-w-[180px]">{u.email}</td>
                          <td className="py-3 pr-4 text-white/90">{u.firstName} {u.lastName}</td>
                          <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded text-xs bg-white/10">{u.role}</span></td>
                          <td className="py-3 pr-4 text-cyan-400">{u.mainSpecialty ?? "—"}</td>
                          <td className="py-3 pr-4">{u.isEmailVerified ? "Oui" : "Non"}</td>
                          <td className="py-3 text-white/60">{formatDate(u.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Recherche utilisateurs */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Recherche utilisateurs</h2>
              <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Email, prénom ou nom..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-cyan-500/50 outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors"
                >
                  Rechercher
                </button>
                {usersQuery && (
                  <button
                    type="button"
                    onClick={() => { setUsersSearch(""); setUsersQuery(""); setUsersPage(0); }}
                    className="px-4 py-2.5 rounded-xl border border-white/20 text-white/80 hover:bg-white/10"
                  >
                    Réinitialiser
                  </button>
                )}
              </form>
              <div className="overflow-x-auto">
                {loadingUsers ? (
                  <div className="py-8 text-center text-white/50">Chargement...</div>
                ) : usersResult ? (
                  <>
                    <p className="text-white/60 text-sm mb-3">
                      {usersResult.total} résultat{usersResult.total !== 1 ? "s" : ""}
                    </p>
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-white/60">
                          <th className="py-3 pr-4">Email</th>
                          <th className="py-3 pr-4">Nom</th>
                          <th className="py-3 pr-4">Rôle</th>
                          <th className="py-3 pr-4">Spécialité</th>
                          <th className="py-3 pr-4">Vérifié</th>
                          <th className="py-3 pr-4">Banni</th>
                          <th className="py-3">Inscrit le</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersResult.users.length === 0 ? (
                          <tr><td colSpan={7} className="py-4 text-white/50">Aucun résultat</td></tr>
                        ) : (
                          usersResult.users.map((u) => (
                            <tr key={u.id} className="border-b border-white/5">
                              <td className="py-3 pr-4 text-white truncate max-w-[160px]">{u.email}</td>
                              <td className="py-3 pr-4 text-white/90">{u.firstName} {u.lastName}</td>
                              <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded text-xs bg-white/10">{u.role}</span></td>
                              <td className="py-3 pr-4 text-cyan-400">{u.mainSpecialty ?? "—"}</td>
                              <td className="py-3 pr-4">{u.isEmailVerified ? "Oui" : "Non"}</td>
                              <td className="py-3 pr-4">{u.isBanned ? "Oui" : "Non"}</td>
                              <td className="py-3 text-white/60">{formatDate(u.createdAt)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    {usersResult.total > PAGE_SIZE && (
                      <div className="flex items-center justify-between mt-4">
                        <button
                          type="button"
                          disabled={usersPage === 0}
                          onClick={() => setUsersPage((p) => Math.max(0, p - 1))}
                          className="px-4 py-2 rounded-lg bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white hover:bg-white/20"
                        >
                          Précédent
                        </button>
                        <span className="text-white/60 text-sm">
                          Page {usersPage + 1} / {Math.ceil(usersResult.total / PAGE_SIZE)}
                        </span>
                        <button
                          type="button"
                          disabled={(usersPage + 1) * PAGE_SIZE >= usersResult.total}
                          onClick={() => setUsersPage((p) => p + 1)}
                          className="px-4 py-2 rounded-lg bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white hover:bg-white/20"
                        >
                          Suivant
                        </button>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </section>

            {/* Workflows n8n */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-2">Workflows n8n</h2>
              <p className="text-white/60 text-sm mb-4">
                Déclencher le workflow &quot;Startup Idea Scraper&quot; (scrape Reddit, analyse IA, envoi Gmail). Utilise l’URL de test : après le run, la page reste en attente du test event (jusqu’à 2 min).
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleRunStartupIdeaScraper}
                  disabled={n8nLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {n8nLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      En attente du test event…
                    </>
                  ) : (
                    "Run Startup Idea Scraper"
                  )}
                </button>
              </div>
              {n8nSuccess && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                  {n8nSuccess}
                </div>
              )}
              {n8nError && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm whitespace-pre-wrap">
                  {n8nError}
                </div>
              )}
            </section>

            {/* Répartition par spécialité */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Utilisateurs par spécialité</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/60">
                      <th className="py-3 pr-4">Spécialité</th>
                      <th className="py-3">Nombre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.specialties.list.map((s) => (
                      <tr key={s} className="border-b border-white/5">
                        <td className="py-3 pr-4 text-white">{s}</td>
                        <td className="py-3 text-cyan-400">{stats.specialties.bySpecialty[s] ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Placeholder : Thématiques hackathon (workflow à venir) */}
            <section className="rounded-2xl border border-dashed border-cyan-500/40 bg-cyan-500/5 p-8">
              <h2 className="text-lg font-semibold text-cyan-400 mb-2">Thématiques hackathon</h2>
              <p className="text-white/60 text-sm mb-4">
                Après intégration du workflow de création automatique des thématiques, vous pourrez ici accepter ou refuser chaque proposition. Les thématiques acceptées seront visibles pour les utilisateurs.
              </p>
              <div className="text-white/40 text-sm italic">Zone d’acceptation à venir.</div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
