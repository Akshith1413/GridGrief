import { type DemoRole, type DemoSession } from "@/lib/types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const SESSION_KEY_PREFIX = "griefgrid-demo-session";

const ROLE_CREDENTIALS: Record<DemoRole, { email: string; password: string }> = {
  admin: {
    email: "admin@griefgrid.local",
    password: "demo-admin",
  },
  responder: {
    email: "responder@griefgrid.local",
    password: "demo-responder",
  },
  family_member: {
    email: "family@griefgrid.local",
    password: "demo-family",
  },
  reporter: {
    email: "reporter@griefgrid.local",
    password: "demo-reporter",
  },
};

function getSessionStorageKey(role: DemoRole) {
  return `${SESSION_KEY_PREFIX}-${role}`;
}

function readStoredSession(role: DemoRole): DemoSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(getSessionStorageKey(role));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DemoSession;
  } catch {
    window.localStorage.removeItem(getSessionStorageKey(role));
    return null;
  }
}

function writeStoredSession(role: DemoRole, session: DemoSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getSessionStorageKey(role), JSON.stringify(session));
}

function isSessionValid(session: DemoSession | null) {
  if (!session) {
    return false;
  }

  return new Date(session.accessTokenExpiresAt).getTime() - 10_000 > Date.now();
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const fallback = `${response.status} ${response.statusText}`;
    try {
      const errorPayload = (await response.json()) as { error?: string };
      throw new Error(errorPayload.error || fallback);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(fallback);
    }
  }

  return (await response.json()) as T;
}

export function apiGet<T>(path: string, token?: string) {
  return apiRequest<T>(path, { method: "GET" }, token);
}

export function apiPost<T>(path: string, body?: unknown, token?: string) {
  return apiRequest<T>(
    path,
    {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    },
    token,
  );
}

export function apiDelete<T>(path: string, token?: string) {
  return apiRequest<T>(
    path,
    {
      method: "DELETE",
    },
    token,
  );
}

export async function ensureDemoSession(role: DemoRole = "admin"): Promise<DemoSession> {
  const cached = readStoredSession(role);
  if (isSessionValid(cached)) {
    return cached as DemoSession;
  }

  const session = await apiPost<DemoSession>("/api/v1/auth/login", ROLE_CREDENTIALS[role]);
  writeStoredSession(role, session);
  return session;
}
