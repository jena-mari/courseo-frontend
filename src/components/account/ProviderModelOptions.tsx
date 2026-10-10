import type { providerModels } from "../../lib/keyApi";

export function ProviderModelOptions({ models }: { models: ReturnType<typeof providerModels> }) {
  const providers = [...new Set(models.map((model) => model.provider))];
  return <>{providers.map((provider) => {
    const items = models.filter((model) => model.provider === provider);
    const first = items[0];
    return <optgroup key={provider} label={`${first.providerLabel} · ${first.keyStatus}`}>
      {items.map((model) => <option key={model.name} value={model.name} disabled={!model.available}>
        {model.label}{!model.available ? ` — ${model.keyStatus}` : ""}
      </option>)}
    </optgroup>;
  })}</>;
}
