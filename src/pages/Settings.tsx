import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  KeyRound,
  LoaderCircle,
  RefreshCw,
  Server,
  Sparkles,
  XCircle,
  UserCircle,
} from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import { CourseoSidebar, type Chat } from "../components/courseo-sidebar";
import { HelpSlider } from "../components/help-carousel";
import { AccountManagement } from "../components/AccountManagementPopup";
import { useAuth } from "../auth/AuthContext";
import { LlmPrivacyDisclosure } from "../components/LlmPrivacyDisclosure";
import { ApiKeysPanel } from "../components/ApiKeysPanel";
import { ElectiveInterestsField, inferElectiveMode, type ElectiveRecommendationMode } from "../components/ElectiveInterestsField";
import { accountStorage, STORAGE_KEYS } from "../lib/storageKeys";
import { checkBackendHealth, type BackendHealth } from "../lib/api";

type SettingsTab = "profile" | "system";

const TABS: Array<{ id: SettingsTab; label: string }> = [
  { id: "profile", label: "Profile & Electives" },
  { id: "system", label: "System" },
];

function getStoredChats(storage: ReturnType<typeof accountStorage>): Chat[] {
  try {
    const chats = JSON.parse(storage.getItem(STORAGE_KEYS.chats) ?? "[]") as Array<{ id?: string; title?: string }>;
    return chats
      .filter((chat): chat is { id: string; title: string } => Boolean(chat.id && chat.title))
      .map(({ id, title }) => ({ id, title }));
  } catch {
    return [];
  }
}

function getStoredProfile(user: { email: string; username: string; commencementYear?: number | null; campus?: "Wollongong" | "Liverpool" | null; major?: string | null; electiveInterests?: string[] } | null | undefined) {
  return {
    email: user?.email ?? "",
    username: user?.username ?? "",
    interests: user?.electiveInterests ?? [],
  };
}

function Panel({
  icon,
  title,
  description,
  children,
  danger = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden rounded-[22px] border border-[rgba(0,1,129,0.16)] bg-white"
    >
      <div className="flex items-center gap-3 border-b border-[rgba(0,1,129,0.12)] bg-[rgba(131,231,255,0.12)] px-5 py-4">
        <div className={danger ? "text-[#a32d2d]" : "text-[#000181]"}>{icon}</div>
        <div>
          <h2
            className={`text-[15px] font-extrabold leading-tight tracking-tight ${
              danger ? "text-[#a32d2d]" : "text-[#000181]"
            }`}
          >
            {title}
          </h2>
          <p className="mt-0.5 text-[12px] font-semibold text-[rgba(0,1,129,0.55)]">
            {description}
          </p>
        </div>
      </div>
      <div>{children}</div>
    </motion.section>
  );
}

function SettingRow({
  label,
  sub,
  children,
}: {
  label: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <div className="courseo-setting-row border-b border-[rgba(0,1,129,0.08)] px-5 py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[13px] font-extrabold text-[#000181]">{label}</p>
        {sub && (
          <p className="mt-0.5 break-words [overflow-wrap:anywhere] text-[12px] font-semibold text-[rgba(0,1,129,0.52)]">
            {sub}
          </p>
        )}
      </div>
      {children && <div className="min-w-0">{children}</div>}
    </div>
  );
}

function TextInput({
  label,
  type = "text",
  value,
  placeholder,
  onChange,
}: {
  label: string;
  type?: "email" | "password" | "text";
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      aria-label={label}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full max-w-full rounded-[12px] border border-[rgba(0,1,129,0.2)] bg-[rgba(131,231,255,0.12)] px-3 text-[12px] font-bold text-[#000181] outline-none transition-colors placeholder:text-[rgba(0,1,129,0.35)] hover:bg-[rgba(131,231,255,0.22)]"
    />
  );
}

function Badge({
  tone = "cyan",
  children,
}: {
  tone?: "cyan" | "pink" | "amber" | "red";
  children: ReactNode;
}) {
  const styles = {
    cyan: "bg-[rgba(131,231,255,0.35)] text-[#000181]",
    pink: "bg-[rgba(232,160,255,0.35)] text-[#000181]",
    amber: "bg-[#fff2c9] text-[#9a6508]",
    red: "bg-[#fcebeb] text-[#a32d2d]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function DangerButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[12px] border border-[#f2b8b8] bg-[#fcebeb] px-4 py-2 text-[12px] font-extrabold text-[#a32d2d] transition-colors hover:bg-[#f7d4d4]"
    >
      {children}
    </button>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile, loadProfile } = useAuth();
  const storage = accountStorage(user?.id);
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => new URLSearchParams(window.location.search).get("tab") === "system" ? "system" : "profile");
  const [showAccount, setShowAccount] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarChats, setSidebarChats] = useState<Chat[]>(() => getStoredChats(storage));
  const [storedProfile] = useState(() => getStoredProfile(user));
  const [profile, setProfile] = useState(() => ({ email: storedProfile.email, username: storedProfile.username }));
  const [saveStatus, setSaveStatus] = useState<"idle" | "dirty" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [checkingBackend, setCheckingBackend] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(storedProfile.interests);
  const [electiveMode, setElectiveMode] = useState<ElectiveRecommendationMode>(() => inferElectiveMode(storedProfile.interests));
  const [confirmation, setConfirmation] = useState<"plans" | null>(null);
  const [dangerBusy, setDangerBusy] = useState(false);
  const [dangerMessage, setDangerMessage] = useState("");

  const [profileLoaded, setProfileLoaded] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setSaveMessage("Loading your profile…");
    void loadProfile(controller.signal).then((saved) => {
      if (controller.signal.aborted) return;
      setProfile({ email: saved.email, username: saved.displayName ?? "" });
      setSelectedInterests(saved.electiveInterests);
      setElectiveMode(inferElectiveMode(saved.electiveInterests));
      setProfileLoaded(true);
      setSaveStatus("idle");
      setSaveMessage("");
    }).catch((cause) => {
      if (controller.signal.aborted) return;
      setSaveStatus("error");
      setSaveMessage(cause instanceof Error ? cause.message : "Unable to load profile.");
    });
    return () => controller.abort();
  }, [loadProfile, loadAttempt]);

  useEffect(() => {
    if (user) setProfile((current) => ({ ...current, email: user.email }));
  }, [user?.email]);

  const refreshBackendHealth = async () => {
    setCheckingBackend(true);
    try {
      setBackendHealth(await checkBackendHealth());
    } finally {
      setCheckingBackend(false);
    }
  };

  useEffect(() => {
    if (activeTab === "system" && !backendHealth && !checkingBackend) {
      void refreshBackendHealth();
    }
  }, [activeTab, backendHealth, checkingBackend]);

  useEffect(() => {
    const requestedTab = new URLSearchParams(location.search).get("tab");
    setActiveTab(requestedTab === "system" ? "system" : "profile");
    if (location.hash === "#api-keys") {
      window.requestAnimationFrame(() => document.getElementById("api-keys")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [location.hash, location.search]);

  const setProfileField = (key: keyof typeof profile, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaveStatus("dirty");
    setSaveMessage("");
  };

  const goToChat = () => navigate("/chat");

  const markProfileDirty = () => {
    setSaveStatus("dirty");
    setSaveMessage("");
  };

  const saveChanges = async () => {
    if (!profileLoaded || saveStatus === "saving") return;
    if (!profile.username.trim() || !/^\S+@\S+\.\S+$/.test(profile.email.trim())) {
      setSaveStatus("error");
      setSaveMessage("Enter a valid name and email address.");
      return;
    }
    if (electiveMode === "interest" && selectedInterests.length === 0) {
      setSaveStatus("error");
      setSaveMessage("Add at least one elective interest or choose degree-based recommendations.");
      return;
    }
    const displayName = profile.username.trim();
    if (!user) return;
    setSaveStatus("saving");
    setSaveMessage("");
    try {
      const saved = await updateProfile({
        display_name: displayName,
        degree_code: "766",
        commencement_year: user.commencementYear ?? null,
        campus: user.campus ?? null,
        major: user.major ?? null,
        elective_interests: electiveMode === "interest" ? selectedInterests : [],
      });
      storage.setItem(STORAGE_KEYS.profile, JSON.stringify({
        displayName: saved.displayName,
        email: saved.email,
        degreeCode: saved.degreeCode,
        degree: "Bachelor of Computer Science",
        commencementYear: saved.commencementYear,
        campus: saved.campus,
        major: saved.major,
        interests: saved.electiveInterests,
      }));
      setProfile({ username: saved.displayName ?? "", email: saved.email });
      setSelectedInterests(saved.electiveInterests);
      setElectiveMode(inferElectiveMode(saved.electiveInterests));
      setSaveStatus("saved");
      setSaveMessage("Profile saved to your account.");
    } catch (cause) {
      setSaveStatus("error");
      setSaveMessage(cause instanceof Error ? cause.message : "Could not save your profile.");
    }
  };

  const confirmDangerAction = async () => {
    if (!confirmation || dangerBusy) return;
    setDangerBusy(true);
    setDangerMessage("");
    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 250));
      const storedChats = JSON.parse(storage.getItem(STORAGE_KEYS.chats) ?? "[]") as Array<Record<string, unknown>>;
      const chatsWithoutPlans = storedChats.map((chat) => ({ ...chat, studyPlanData: null }));
      storage.setItem(STORAGE_KEYS.chats, JSON.stringify(chatsWithoutPlans));
      storage.removeItem(STORAGE_KEYS.bootstrapChat);
      setDangerMessage("Your saved study plans were cleared. Your conversations are still available.");
      setConfirmation(null);
    } catch {
      try {
        storage.removeItem(STORAGE_KEYS.chats);
        storage.removeItem(STORAGE_KEYS.bootstrapChat);
        setSidebarChats([]);
        setDangerMessage("Your saved study plans were cleared. Unreadable saved conversations were also removed.");
        setConfirmation(null);
      } catch {
        setDangerMessage("Courseo could not clear your saved study plans. Please try again.");
      }
    } finally {
      setDangerBusy(false);
    }
  };

  const deleteSidebarChat = (id: string) => {
    setSidebarChats((current) => {
      const next = current.filter((chat) => chat.id !== id);
      try {
        const stored = JSON.parse(storage.getItem(STORAGE_KEYS.chats) ?? "[]") as Array<{ id?: string }>;
        storage.setItem(STORAGE_KEYS.chats, JSON.stringify(stored.filter((chat) => chat.id !== id)));
      } catch {
        storage.removeItem(STORAGE_KEYS.chats);
      }
      return next;
    });
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-clip font-['Montserrat',sans-serif]">
      <img
        src={imgBg}
        className="absolute inset-0 h-full w-full object-cover"
        alt=""
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 courseo-workspace flex items-stretch gap-3 p-2.5 sm:p-4 xl:gap-4 xl:p-5">
        <div className="hidden h-full lg:block">
          <CourseoSidebar
            chats={sidebarChats}
            activeChatId="settings"
            onNewChat={goToChat}
            onSelectChat={goToChat}
            onDeleteChat={deleteSidebarChat}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((value) => !value)}
            onAccount={() => setShowAccount(true)}
            onHelp={() => setShowHelp(true)}
            onSettings={() => navigate("/settings")}
            onApiKeys={() => navigate("/settings?tab=system#api-keys")}
            activeUtility={location.hash === "#api-keys" ? "apiKeys" : "settings"}
          />
        </div>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[30px] bg-white shadow-[2px_2px_10px_3px_rgba(0,0,0,0.1)]">
          <div className="shrink-0 px-4 pt-5 sm:px-7 sm:pt-6">
            <button
              type="button"
              onClick={goToChat}
              className="mb-3 inline-flex items-center gap-2 rounded-[12px] px-2 py-1 text-[12px] font-extrabold text-[rgba(0,1,129,0.62)] transition-colors hover:bg-[rgba(131,231,255,0.18)] hover:text-[#000181]"
            >
              <ArrowLeft size={15} />
              Back to chat
            </button>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-[34px] font-black leading-none tracking-tight text-[#000181]">
                  Settings
                </h1>
                <p className="mt-2 text-[13px] font-semibold text-[rgba(0,1,129,0.55)]">
                  Manage your profile and integrations.
                </p>
              </div>
              {activeTab === "profile" && <div className="flex items-center gap-3"><span role={saveStatus === "error" ? "alert" : "status"} className={`text-[11px] font-bold ${saveStatus === "error" ? "text-red-600" : "text-emerald-700"}`}>{saveMessage}</span><button type="button" onClick={() => void saveChanges()} disabled={!profileLoaded || saveStatus === "saving" || saveStatus === "saved"} className="flex h-10 items-center gap-2 rounded-[13px] bg-[#000181] px-5 text-[12px] font-extrabold text-white shadow-sm disabled:bg-[#c8cae8] disabled:text-[#000181]"><Check size={14} /> {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : "Save changes"}</button></div>}
            </div>
          </div>

          <div
            className="mt-5 flex shrink-0 gap-1 overflow-x-auto border-b border-[rgba(0,1,129,0.16)] px-4 sm:px-7"
            role="tablist"
          >
            {TABS.map((tab) => {
              const selected = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setActiveTab(tab.id);
                    navigate(`/settings?tab=${tab.id}`, { replace: true });
                  }}
                  className={`rounded-t-[12px] border-b-2 px-4 py-3 text-[12px] font-extrabold transition-colors ${
                    selected
                      ? "border-[#000181] text-[#000181]"
                      : "border-transparent text-[rgba(0,1,129,0.52)] hover:bg-[rgba(131,231,255,0.14)] hover:text-[#000181]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="courseo-scroll courseo-settings-content min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-6" role="region" aria-label="Settings content" tabIndex={0}>
            {activeTab === "profile" && !profileLoaded && saveStatus === "error" && <button type="button" onClick={() => setLoadAttempt((value) => value + 1)} className="mb-4 text-sm font-bold text-[#000181]">Retry loading profile</button>}
            {activeTab === "profile" && (
              <fieldset disabled={!profileLoaded || saveStatus === "saving"} className="grid min-w-0 gap-5 disabled:opacity-60">
                <Panel
                  icon={<UserCircle size={20} strokeWidth={2.5} />}
                  title="Student profile"
                  description="Academic identity used for personalised planning"
                >
                  <SettingRow label="Account email" sub={profile.email}>
                    <button type="button" onClick={() => setShowAccount(true)} className="rounded-[12px] border border-[rgba(0,1,129,0.2)] px-4 py-2 text-[11px] font-extrabold text-[#000181] hover:bg-[#eef0ff]">Manage account</button>
                  </SettingRow>
                  <SettingRow label="Preferred name" sub="Used when Courseo addresses you">
                    <TextInput
                      label="Preferred name"
                      value={profile.username}
                      placeholder="Enter your preferred name"
                      onChange={(value) => setProfileField("username", value)}
                    />
                  </SettingRow>
                </Panel>

                <Panel
                  icon={<Sparkles size={20} strokeWidth={2.5} />}
                  title="Degree & faculty"
                  description="Personalise your elective recommendations"
                >
                  <div className="p-5">
                    <ElectiveInterestsField
                      mode={electiveMode}
                      interests={selectedInterests}
                      onModeChange={(mode) => { setElectiveMode(mode); markProfileDirty(); }}
                      onInterestsChange={(interests) => { setSelectedInterests(interests); markProfileDirty(); }}
                    />
                  </div>
                </Panel>
              </fieldset>
            )}

            {activeTab === "system" && (
              <div className="grid gap-5">
                <Panel icon={<AlertTriangle size={20} />} title="AI privacy warning" description="Review what Courseo shares with your AI provider">
                  <SettingRow label="View the AI warning again" sub="Your acknowledgement is remembered for this account in this browser.">
                    <button type="button" onClick={() => setShowPrivacy(true)} className="rounded-[12px] bg-[#eef0ff] px-4 py-2 text-[12px] font-extrabold text-[#000181]">View warning</button>
                  </SettingRow>
                </Panel>
                <div id="api-keys" className="scroll-mt-5">
                  <Panel
                    icon={<KeyRound size={20} strokeWidth={2.5} />}
                    title="AI provider keys"
                    description="Connect and manage your personal provider credentials"
                  >
                    <ApiKeysPanel />
                  </Panel>
                </div>

                <Panel
                  icon={<Server size={20} strokeWidth={2.5} />}
                  title="Backend status"
                  description="Live connection to Courseo services"
                >
                  <SettingRow
                    label="Courseo API"
                    sub="Checks whether Courseo can respond from this browser"
                  >
                    {checkingBackend ? (
                      <Badge tone="amber"><LoaderCircle size={12} className="animate-spin" /> Checking</Badge>
                    ) : backendHealth?.state === "online" ? (
                      <Badge><Check size={12} strokeWidth={3} /> Online</Badge>
                    ) : backendHealth?.state === "unauthorized" ? (
                      <Badge tone="amber">Session expired</Badge>
                    ) : (
                      <Badge tone="red"><XCircle size={12} /> Unavailable</Badge>
                    )}
                  </SettingRow>
                  <SettingRow
                    label="Response time"
                    sub={backendHealth ? `${backendHealth.latencyMs} ms` : "Waiting for first check"}
                  />
                  <SettingRow
                    label="Last checked"
                    sub={backendHealth ? backendHealth.checkedAt.toLocaleTimeString() : "Not checked yet"}
                  >
                    <button
                      type="button"
                      onClick={() => void refreshBackendHealth()}
                      disabled={checkingBackend}
                      className="flex h-9 items-center gap-2 rounded-[12px] border border-[rgba(0,1,129,0.16)] px-3 !text-[11px] font-extrabold text-[#000181] transition-colors hover:bg-[rgba(131,231,255,0.18)] disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={checkingBackend ? "animate-spin" : ""} /> Refresh
                    </button>
                  </SettingRow>
                </Panel>

                <Panel
                  icon={<AlertTriangle size={20} strokeWidth={2.5} />}
                  title="Danger zone"
                  description="Irreversible account actions"
                  danger
                >
                  <SettingRow
                    label="Clear saved study plans"
                    sub="Permanently remove generated plans while keeping your conversations"
                  >
                    <DangerButton onClick={() => { setConfirmation("plans"); setDangerMessage(""); }}>Clear plans</DangerButton>
                  </SettingRow>
                  <SettingRow
                    label="Delete account"
                    sub="Backend support is required before this action can be enabled"
                  >
                    <Badge tone="amber">Backend required</Badge>
                  </SettingRow>
                </Panel>
                {dangerMessage && <p role="status" className={`rounded-[14px] px-4 py-3 text-[12px] font-semibold ${dangerMessage.includes("cleared") ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{dangerMessage}</p>}
              </div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showAccount && (
          <AccountManagement onClose={() => setShowAccount(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrivacy && <LlmPrivacyDisclosure reviewOnly onAcknowledge={() => setShowPrivacy(false)} onLeave={() => setShowPrivacy(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showHelp && (
          <HelpSlider onClose={() => setShowHelp(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex flex-col overflow-y-auto overscroll-contain bg-black/45 p-4 touch-pan-y [-webkit-overflow-scrolling:touch]" onClick={() => !dangerBusy && setConfirmation(null)} role="presentation">
            <motion.div initial={{ scale: 0.94, y: 14 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 14 }} className="mx-auto my-auto w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()} role="alertdialog" aria-modal="true" aria-labelledby="danger-confirmation-title">
              <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-red-50 text-red-700"><AlertTriangle size={21} /></span><div><h2 id="danger-confirmation-title" className="text-[18px] font-black text-[#000181]">Clear all saved study plans?</h2><p className="mt-2 text-[12px] font-semibold leading-relaxed text-[rgba(0,1,129,0.62)]">Every generated study plan saved in this browser will be permanently removed. Your conversations, profile, enrolment record, and API keys will stay.</p></div></div>
              <div className="mt-6 flex gap-3"><button type="button" onClick={() => setConfirmation(null)} disabled={dangerBusy} className="h-12 flex-1 rounded-[15px] border border-[rgba(0,1,129,0.2)] text-[12px] font-extrabold text-[#000181]">Cancel</button><button type="button" onClick={() => void confirmDangerAction()} disabled={dangerBusy} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[15px] bg-red-700 text-[12px] font-extrabold text-white disabled:cursor-wait disabled:opacity-50">{dangerBusy && <LoaderCircle size={15} className="animate-spin" />}{dangerBusy ? "Clearing plans…" : "Clear saved plans"}</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



    </div>
  );
}
