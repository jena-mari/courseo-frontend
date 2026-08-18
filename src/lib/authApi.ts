import { api } from "./api";

export interface UserOut {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
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

export function fetchCurrentUser() {
  return api<UserOut>("/api/v1/auth/me");
}
