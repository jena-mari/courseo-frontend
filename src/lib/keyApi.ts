import { api } from "./api";

export interface ProviderModel { name: string; label: string; priced: boolean }
export interface KeyProvider {
  provider: string;
  label: string;
  console_url: string;
  models: ProviderModel[];
  default_model: string;
  key_count: number;
  has_usable_key: boolean;
}
export interface ProvidersResponse {
  providers: KeyProvider[];
  default_model: string;
  system_fallback_enabled: boolean;
}
export interface SavedCredential {
  id: string;
  provider: string;
  label: string | null;
  last4: string;
  is_default: boolean;
  status: "active" | "invalid" | string;
  created_at: string;
  last_used_at: string | null;
  last_verified_at: string | null;
}

export const getKeyProviders = () => api<ProvidersResponse>("/api/v1/keys/providers");
export const getSavedKeys = () => api<SavedCredential[]>("/api/v1/keys");
export const addApiKey = (input: { provider: string; api_key: string; label?: string; make_default?: boolean }) =>
  api<SavedCredential>("/api/v1/keys", { method: "POST", body: JSON.stringify(input) });
export const updateApiKey = (id: string, input: { label?: string; api_key?: string; make_default?: boolean }) =>
  api<SavedCredential>(`/api/v1/keys/${id}`, { method: "PATCH", body: JSON.stringify(input) });
export const verifyApiKey = (id: string) =>
  api<{ id: string; status: string; verified: boolean; detail: string }>(`/api/v1/keys/${id}/verify`, { method: "POST" });
export const deleteApiKey = (id: string) => api<void>(`/api/v1/keys/${id}`, { method: "DELETE" });

/** Models the current user can actually run with a personal key or Gemini fallback. */
export function usableProviderModels(data: ProvidersResponse | null) {
  if (!data) return [];
  return data.providers
    .filter((provider) => provider.has_usable_key || (provider.provider === "gemini" && data.system_fallback_enabled))
    .flatMap((provider) => provider.models.map((model) => ({ ...model, provider: provider.provider, providerLabel: provider.label })));
}
