import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { accountStorage, STORAGE_KEYS } from "../../lib/storageKeys";
import { getKeyProviders, personalKeyState, usableProviderModels, type ProviderModel } from "../../lib/keyApi";

export function useChatAccess(setChatError: Dispatch<SetStateAction<string>>) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const storage = useMemo(() => accountStorage(user?.id), [user?.id]);
  const [availableModels, setAvailableModels] = useState<Array<ProviderModel & { provider: string; providerLabel: string }>>([]);
  const [selectedModel, setSelectedModel] = useState(storage.getItem(STORAGE_KEYS.selectedModel) ?? "");
  const [keyStatus, setKeyStatus] = useState<"checking" | "ready" | "invalid" | "missing" | "error">("checking");
  const [showKeyNotice, setShowKeyNotice] = useState(false);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(() => Boolean(user?.id && storage.getItem(STORAGE_KEYS.llmPrivacyAcknowledged) === user.id));
  useEffect(() => {
    setPrivacyAcknowledged(Boolean(user?.id && storage.getItem(STORAGE_KEYS.llmPrivacyAcknowledged) === user.id));
  }, [user?.id]);

  useEffect(() => {
    setKeyStatus("checking");
    void getKeyProviders().then((data) => {
      const models = usableProviderModels(data);
      setAvailableModels(models);
      const state = personalKeyState(data);
      if (state === "missing") {
        setKeyStatus("missing");
        navigate("/connect-key", {
          replace: true,
          state: { detail: "Connect and verify a personal API key before starting a Courseo chat." },
        });
        return;
      }
      if (state === "invalid") {
        setKeyStatus("invalid");
        setShowKeyNotice(true);
        return;
      }
      setKeyStatus("ready");
      setSelectedModel((current) => {
        const next = models.some((item) => item.name === current)
          ? current
          : models.find((item) => item.name === data.default_model)?.name ?? models[0]?.name ?? "";
        if (next) storage.setItem(STORAGE_KEYS.selectedModel, next);
        return next;
      });
    }).catch(() => {
      setAvailableModels([]);
      setKeyStatus("error");
      setChatError("Courseo could not confirm your API key. Open API Keys and try again.");
    });
  }, [navigate]);

  const requireChatAccess = useCallback(() => {
    if (!privacyAcknowledged) return false;
    if (keyStatus === "ready") return true;
    if (keyStatus === "invalid") {
      setShowKeyNotice(true);
      return false;
    }
    if (keyStatus === "missing") {
      navigate("/connect-key", { state: { detail: "Connect and verify a personal API key before starting a Courseo chat." } });
      return false;
    }
    setChatError(keyStatus === "checking" ? "Courseo is checking your API key…" : "Courseo could not confirm your API key. Open API Keys and try again.");
    return false;
  }, [keyStatus, navigate, privacyAcknowledged]);

  const handleUnavailableKey = useCallback(async (detail: string) => {
    try {
      const data = await getKeyProviders();
      const state = personalKeyState(data);
      if (state === "missing") {
        setKeyStatus("missing");
        navigate("/connect-key", { state: { detail: "Connect and verify a personal API key before starting a Courseo chat." } });
        return;
      }
      if (state === "invalid") {
        setKeyStatus("invalid");
        setShowKeyNotice(true);
        setChatError("");
        return;
      }
      setAvailableModels(usableProviderModels(data));
      setKeyStatus("invalid");
      setShowKeyNotice(true);
      setChatError("");
    } catch {
      setKeyStatus("error");
      setChatError(detail || "Courseo could not verify your API key.");
    }
  }, [navigate]);

  const acknowledgePrivacy = () => {
    if (!user?.id) return;
    storage.setItem(STORAGE_KEYS.llmPrivacyAcknowledged, user.id);
    setPrivacyAcknowledged(true);
  };

  const changeModel = (model: string) => {
    setSelectedModel(model);
    storage.setItem(STORAGE_KEYS.selectedModel, model);
  };

  return { availableModels, selectedModel, keyStatus, showKeyNotice, setShowKeyNotice,
    privacyAcknowledged, requireChatAccess, handleUnavailableKey, acknowledgePrivacy, changeModel };
}
