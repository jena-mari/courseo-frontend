import { api } from "./api";
import type { ProfileUpdate, UserOut } from "./authApi";

export const loadProfile = (signal?: AbortSignal) => api<UserOut>("/api/v1/auth/me", { signal });
export const saveProfile = (changes: ProfileUpdate) => api<UserOut>("/api/v1/auth/me", {
  method: "PATCH",
  body: JSON.stringify(changes),
});
