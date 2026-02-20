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
