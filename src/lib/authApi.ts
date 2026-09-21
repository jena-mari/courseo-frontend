import { api } from "./api";

export interface UserOut {
  id: string;
  email: string;
  display_name: string | null;
  degree_code: "766";
  commencement_year: number | null;
  campus: "Wollongong" | "Liverpool" | null;
  major: string | null;
  elective_interests: string[];
  created_at: string;
}

export interface ProfileUpdate {
  email: string;
  display_name: string;
  degree_code: "766";
  commencement_year: number;
  campus: "Wollongong" | "Liverpool";
  major: string | null;
  elective_interests: string[];
  current_password?: string;
}

export function registerUser(input: {
  email: string;
  password: string;
  display_name?: string | null;
}) {
  return api<UserOut>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginUser(input: { email: string; password: string }) {
  return api<UserOut>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logoutUser() {
  return api<void>("/api/v1/auth/logout", { method: "POST" });
}

export function fetchCurrentUser(signal?: AbortSignal) {
  return api<UserOut>("/api/v1/auth/me", { signal });
}

export function updateCurrentUser(input: ProfileUpdate) {
  return api<UserOut>("/api/v1/auth/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return api<void>("/api/v1/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

export function requestPasswordReset(email: string) {
  return api<void>("/api/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, password: string) {
  return api<void>("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}
