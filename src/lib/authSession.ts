import { STORAGE_KEYS } from "./storageKeys";

const AUTH_SESSION_KEY = STORAGE_KEYS.authSession;
const USER_KEY = STORAGE_KEYS.user;
const REMEMBERED_SESSION_LIFETIME = 30 * 24 * 60 * 60 * 1000;
const BROWSER_SESSION_LIFETIME = 12 * 60 * 60 * 1000;

export interface CourseoUser {
  username: string;
  email?: string;
  provider?: string;
}

export interface AuthSession {
  sessionId: string;
  user: CourseoUser;
  createdAt: string;
  expiresAt: string;
  persistent: boolean;
}

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `courseo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sessionStorageFor(persistent: boolean) {
  return persistent ? localStorage : sessionStorage;
}

export function createAuthSession(
  user: CourseoUser,
  persistent = false
): AuthSession {
  const createdAt = new Date();
  const lifetime = persistent
    ? REMEMBERED_SESSION_LIFETIME
    : BROWSER_SESSION_LIFETIME;
  const session: AuthSession = {
    sessionId: createSessionId(),
    user,
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(createdAt.getTime() + lifetime).toISOString(),
    persistent,
  };
  const storage = sessionStorageFor(persistent);
  const otherStorage = sessionStorageFor(!persistent);

  otherStorage.removeItem(AUTH_SESSION_KEY);
  otherStorage.removeItem(USER_KEY);
  storage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  storage.setItem(USER_KEY, JSON.stringify(user));

  return session;
}

export function getAuthSession(): AuthSession | null {
  const raw =
    sessionStorage.getItem(AUTH_SESSION_KEY) ??
    localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as AuthSession;
    if (
      !session.sessionId ||
      !session.user?.username ||
      Date.parse(session.expiresAt) <= Date.now()
    ) {
      clearAuthSession();
      return null;
    }
    return session;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function updateAuthSessionUser(user: CourseoUser) {
  const current = getAuthSession();
  if (!current) return null;

  const updated: AuthSession = { ...current, user };
  const storage = sessionStorageFor(current.persistent);
  storage.setItem(AUTH_SESSION_KEY, JSON.stringify(updated));
  storage.setItem(USER_KEY, JSON.stringify(user));
  return updated;
}
