import { API_BASE_URL, ApiError } from "./api";
import type { ProfileUpdate, UserOut } from "./authApi";

async function profileRequest(method: "GET" | "PATCH", profile?: ProfileUpdate, signal?: AbortSignal): Promise<UserOut> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      method,
      credentials: "include",
      signal,
      ...(profile !== undefined && {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      }),
    });
  } catch {
    throw new ApiError("Unable to reach Courseo. Check your connection and try again.", 0);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) throw new ApiError("Please sign in again.", 401);
    const message = Array.isArray(data?.detail)
      ? data.detail.map((error: { msg?: string }) => error.msg).filter(Boolean).join(", ")
      : typeof data?.detail === "string" ? data.detail : "";
    throw new ApiError(message || "Unable to update profile.", response.status);
  }
  if (!data) throw new ApiError("Courseo returned an invalid profile. Please try again.", response.status);
  return data;
}

export const loadProfile = (signal?: AbortSignal) => profileRequest("GET", undefined, signal);
export const saveProfile = (changes: ProfileUpdate) => profileRequest("PATCH", changes);
