import { STORAGE_KEYS } from "./storageKeys";
import type { UserOut } from "./authApi";

const USER_KEY = STORAGE_KEYS.user;

/** UI-facing user profile. Auth proof lives in the HttpOnly cookie, not here. */
export interface CourseoUser {
  id: string;
  email: string;
  displayName: string | null;
  /** Display label: display name, or email local-part. */
  username: string;
}

export function toCourseoUser(user: UserOut): CourseoUser {
  const displayName = user.display_name?.trim() || null;
  return {
    id: user.id,
    email: user.email,
    displayName,
    username: displayName || user.email.split("@")[0] || user.email,
  };
}

/** Optional cache for settings/account UI; never treat as proof of login. */
export function cacheAuthUser(user: CourseoUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  sessionStorage.removeItem(USER_KEY);
}

export function getCachedAuthUser(): CourseoUser | null {
  const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as CourseoUser;
    if (!user?.id || !user?.email) {
      clearCachedAuthUser();
      return null;
    }
    return user;
  } catch {
    clearCachedAuthUser();
    return null;
  }
}

export function clearCachedAuthUser(): void {
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(STORAGE_KEYS.authSession);
  sessionStorage.removeItem(STORAGE_KEYS.authSession);
}

/** @deprecated Use getCachedAuthUser / AuthProvider. Kept for gradual call-site updates. */
export function getAuthSession(): { user: CourseoUser } | null {
  const user = getCachedAuthUser();
  return user ? { user } : null;
}

/** @deprecated Use cacheAuthUser via AuthProvider.updateUser. */
export function updateAuthSessionUser(user: CourseoUser): CourseoUser | null {
  if (!user.id || !user.email) return null;
  cacheAuthUser(user);
  return user;
}

/** @deprecated Use clearCachedAuthUser / AuthProvider.logout. */
export function clearAuthSession(): void {
  clearCachedAuthUser();
}
