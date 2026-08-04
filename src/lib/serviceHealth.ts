import { STORAGE_KEYS } from "./storageKeys";

export type ServiceHealthState = "operational" | "unavailable";

export interface CourseoServiceHealth {
  chatApi: ServiceHealthState;
  message: string;
  checkedAt: string;
}

const DEFAULT_HEALTH: CourseoServiceHealth = {
  chatApi: "operational",
  message: "All connected planning services are operational.",
  checkedAt: "",
};

export function getServiceHealth(): CourseoServiceHealth {
  const raw = localStorage.getItem(STORAGE_KEYS.serviceHealth);
  if (!raw) return DEFAULT_HEALTH;

  try {
    const parsed = JSON.parse(raw) as Partial<CourseoServiceHealth>;
    if (
      (parsed.chatApi === "operational" || parsed.chatApi === "unavailable") &&
      typeof parsed.message === "string" &&
      typeof parsed.checkedAt === "string"
    ) {
      return parsed as CourseoServiceHealth;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEYS.serviceHealth);
  }

  return DEFAULT_HEALTH;
}

export function setServiceHealth(
  chatApi: ServiceHealthState,
  message: string
) {
  const health: CourseoServiceHealth = {
    chatApi,
    message,
    checkedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.serviceHealth, JSON.stringify(health));
  window.dispatchEvent(new CustomEvent("courseo:service-health", { detail: health }));
  return health;
}
