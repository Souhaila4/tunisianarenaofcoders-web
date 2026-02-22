export type SignUpPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type SignInPayload = {
  email: string;
  password: string;
};

// En navigateur : /api → proxy Next (3001) vers le backend (3000)
const BACKEND_BASE =
  (typeof window !== "undefined" ? "/api" : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");

async function request(path: string, init: RequestInit) {
  // add Authorization header if token exists and not already set
  const token = getToken();
  const headers = new Headers(init.headers ?? {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(`${BACKEND_BASE}${path}`, { ...init, headers });
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = (text && text.trim()) ? JSON.parse(text) : {};
  } catch {
    // Réponse non-JSON (ex. "Internal Server Error" en texte)
    if (!res.ok) throw { message: text || res.statusText || "Server error" };
    throw { message: "Invalid response from server" };
  }
  if (!res.ok) {
    const isHtml = text.trimStart().toLowerCase().startsWith("<!doctype") || text.trimStart().toLowerCase().startsWith("<html");
    const message = isHtml
      ? "Backend unreachable or returned an error. Check that the backend is running (e.g. on port 3000)."
      : (json && typeof json === "object" && "message" in json && typeof (json as { message?: string }).message === "string")
        ? (json as { message: string }).message
        : text || res.statusText;
    throw { message };
  }
  return json;
}

/** Inscription avec formulaire JSON (legacy). Le backend attend en fait multipart + CV .docx → utiliser signUpWithResume. */
export async function signUp(payload: SignUpPayload) {
  return request('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/** Inscription avec CV .docx (multipart/form-data) — conforme au backend NestJS. */
export async function signUpWithResume(formData: FormData) {
  const base = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const url = typeof window !== "undefined" ? "/api/auth/signup" : `${base}/auth/signup`;
  const headers: HeadersInit = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(url, { method: 'POST', headers, body: formData });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw { message: `Cannot reach backend (${msg}). Start the backend and set NEXT_PUBLIC_API_URL in .env.local if it uses another port.` };
  }
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = (text && text.trim()) ? JSON.parse(text) : {};
  } catch {
    if (!res.ok) throw { message: text || res.statusText || "Server error" };
    throw { message: "Invalid response from server" };
  }
  if (!res.ok) {
    const isHtml = text.trimStart().toLowerCase().startsWith("<!doctype") || text.trimStart().toLowerCase().startsWith("<html");
    const msg = isHtml
      ? "Backend unreachable. Start the backend and set NEXT_PUBLIC_API_URL in .env.local if it uses another port."
      : (json && typeof json === "object" && "message" in json && typeof (json as { message?: string }).message === "string")
        ? (json as { message: string }).message
        : text || res.statusText;
    throw { message: msg };
  }
  return json;
}

export async function signIn(payload: SignInPayload) {
  return request('/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function saveToken(accessToken: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('aoc_access_token', accessToken);
  }
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('aoc_access_token');
}

export async function verifyEmail(email: string, code: string) {
  return request('/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
}

export async function resendVerification(email: string) {
  return request('/auth/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function forgotPassword(email: string) {
  return request('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(email: string, code: string, newPassword: string) {
  return request('/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
  });
}

export async function getProfile() {
  return request('/auth/me', { method: 'GET' });
}

/** Statistiques plateforme (réservé admin). */
export async function getAdminDashboardStats(): Promise<{
  users: { total: number; verified: number; banned: number; noSpecialty: number; byRole: Record<string, number> };
  specialties: { list: string[]; bySpecialty: Record<string, number> };
  rooms: { total: number; description: string };
}> {
  const res = await request('/admin/dashboard/stats', { method: 'GET' });
  return res as Awaited<ReturnType<typeof getAdminDashboardStats>>;
}

export type AdminUserRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  mainSpecialty: string | null;
  isEmailVerified: boolean;
  isBanned: boolean;
  createdAt: string;
};

/** Derniers utilisateurs inscrits (admin). */
export async function getAdminRecentUsers(limit?: number): Promise<AdminUserRow[]> {
  const url = limit ? `/admin/users/recent?limit=${limit}` : '/admin/users/recent';
  const res = await request(url, { method: 'GET' });
  return res as unknown as AdminUserRow[];
}

/** Liste utilisateurs avec recherche et pagination (admin). */
export async function getAdminUsers(params: { limit?: number; offset?: number; search?: string }): Promise<{
  users: AdminUserRow[];
  total: number;
  limit: number;
  offset: number;
}> {
  const sp = new URLSearchParams();
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.offset != null) sp.set('offset', String(params.offset));
  if (params.search) sp.set('search', params.search);
  const q = sp.toString();
  const res = await request(`/admin/users${q ? `?${q}` : ''}`, { method: 'GET' });
  return res as Awaited<ReturnType<typeof getAdminUsers>>;
}

const N8N_WEBHOOK_TIMEOUT_MS = 120_000;

/** Déclenche le webhook n8n (test) via le backend (évite CORS). Timeout 2 min. */
export async function triggerN8nWebhookTest(signal?: AbortSignal): Promise<{ success: boolean; message?: string }> {
  const token = getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BACKEND_BASE}/admin/n8n/webhook-test`, {
    method: 'POST',
    headers,
    body: '{}',
    signal,
  });
  const text = await res.text();
  let json: { success?: boolean; message?: string } = {};
  try {
    json = (text && text.trim()) ? JSON.parse(text) : {};
  } catch {
    if (!res.ok) return { success: false, message: text || res.statusText };
    return { success: false, message: 'Invalid response from server' };
  }
  if (!res.ok) {
    const msg = (json && typeof json.message === 'string') ? json.message : text || res.statusText;
    return { success: false, message: msg };
  }
  return { success: Boolean(json.success), message: json.message };
}

/** Get Stream Chat/Video user token from backend (requires auth). */
export async function getStreamToken(userId?: string): Promise<{ token: string; apiKey?: string }> {
  const body = userId ? { userId } : {};
  const res = await request('/stream/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res as { token: string; apiKey?: string };
}

/** Rejoindre le canal Arena Live côté serveur (requis pour pouvoir envoyer des messages). */
export async function ensureArenaJoin(): Promise<{ ok: boolean }> {
  const res = await request('/stream/arena/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return res as { ok: boolean };
}

/** Liste de toutes les salles hackathon avec indicateur canParticipate selon la spécialité. */
export async function getHackathonRooms(): Promise<{
  rooms: { id: string; name: string; description: string; specialty?: string; canParticipate: boolean }[];
}> {
  const res = await request('/stream/rooms', { method: 'GET' });
  return res as { rooms: { id: string; name: string; description: string; specialty?: string; canParticipate: boolean }[] };
}

/** Rejoindre une salle hackathon côté serveur (chat + visio + partage d'écran). */
export async function ensureRoomJoin(roomId: string): Promise<{ ok: boolean }> {
  const res = await request(`/stream/room/${encodeURIComponent(roomId)}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return res as { ok: boolean };
}

export function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('aoc_access_token');
  }
}

export async function updateProfile(dto: Record<string, any>) {
  return request('/auth/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

/** Récupère le classement public de tous les utilisateurs (leaderboard). */
export type LeaderboardUser = {
  id: string;
  rank: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  mainSpecialty: string;
  xp: number;
  skillTags: string[];
};

export async function getLeaderboard(): Promise<{ total: number; users: LeaderboardUser[] }> {
  const res = await request('/user/leaderboard', { method: 'GET' });
  return res as { total: number; users: LeaderboardUser[] };
}
