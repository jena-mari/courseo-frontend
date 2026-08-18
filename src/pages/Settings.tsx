import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Check,
  ExternalLink,
  GraduationCap,
  KeyRound,
  Server,
  UserCircle,
} from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import { CourseoSidebar, type Chat } from "../components/courseo-sidebar";
import { HelpSlider } from "../components/help-carousel";
import { AccountManagement } from "../components/AccountManagementPopup";
import { HandbookModal } from "../components/HandbookModalPopup";
import { useAuth } from "../auth/AuthContext";
import { saveGeminiApiKey } from "../lib/chatApi";
import { STORAGE_KEYS } from "../lib/storageKeys";

type SettingsTab = "profile" | "notifications" | "system";

const TABS: Array<{ id: SettingsTab; label: string }> = [
  { id: "profile", label: "Profile & Degree" },
  { id: "notifications", label: "Notifications" },
  { id: "system", label: "System" },
];

function getStoredChats(): Chat[] {
  try {
    const chats = JSON.parse(localStorage.getItem(STORAGE_KEYS.chats) ?? "[]") as Array<{ id?: string; title?: string }>;
    return chats
      .filter((chat): chat is { id: string; title: string } => Boolean(chat.id && chat.title))
      .map(({ id, title }) => ({ id, title }));
  } catch {
    return [];
  }
}

const ELECTIVE_INTERESTS = [
  "Machine Learning",
  "Cybersecurity",
  "Human-Computer Interaction",
  "Data Engineering",
  "Cloud Computing",
  "Entrepreneurship",
  "Embedded Systems",
];

const MAJORS = [
  "Artificial Intelligence and Big Data",
  "Cybersecurity",
  "Digital Systems Security",
  "Game and Mobile Development",
  "Software Engineering",
];

function getStoredProfile(user: { email: string; username: string } | null | undefined) {
  return {
    email: user?.email ?? "",
    username: user?.username ?? "",
    password: "",
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
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(0,1,129,0.08)] px-5 py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[13px] font-extrabold text-[#000181]">{label}</p>
        {sub && (
          <p className="mt-0.5 text-[12px] font-semibold text-[rgba(0,1,129,0.52)]">
            {sub}
          </p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[24px] w-[44px] shrink-0 rounded-full transition-colors ${
        checked ? "bg-[#000181]" : "bg-[rgba(0,1,129,0.22)]"
      }`}
    >
      <span
        className={`absolute left-0 top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[23px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 rounded-[12px] border border-[rgba(0,1,129,0.2)] bg-[rgba(131,231,255,0.12)] px-3 text-[12px] font-bold text-[#000181] outline-none transition-colors hover:bg-[rgba(131,231,255,0.22)]"
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
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
      className="h-9 w-64 max-w-[42vw] rounded-[12px] border border-[rgba(0,1,129,0.2)] bg-[rgba(131,231,255,0.12)] px-3 text-[12px] font-bold text-[#000181] outline-none transition-colors placeholder:text-[rgba(0,1,129,0.35)] hover:bg-[rgba(131,231,255,0.22)]"
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

function DangerButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-[12px] border border-[#f2b8b8] bg-[#fcebeb] px-4 py-2 text-[12px] font-extrabold text-[#a32d2d] transition-colors hover:bg-[#f7d4d4]"
    >
      {children}
    </button>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [showAccount, setShowAccount] = useState(false);
  const [showHandbook, setShowHandbook] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarChats, setSidebarChats] = useState<Chat[]>(getStoredChats);
  const [profile, setProfile] = useState(() => getStoredProfile(user));
  const [degree, setDegree] = useState("Bachelor of Computer Science");
  const [major, setMajor] = useState("Artificial Intelligence and Big Data");
  const [geminiKey, setGeminiKey] = useState("");
  const [keyStatus, setKeyStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [keyMessage, setKeyMessage] = useState("");
  const [notificationChannel, setNotificationChannel] = useState("In-app only");
  const [customInterest, setCustomInterest] = useState("");
  const [selectedInterests, setSelectedInterests] = useState(
    () => new Set(["Machine Learning", "Cybersecurity", "Cloud Computing"])
  );
  const [toggles, setToggles] = useState({
    deadlineReminders: true,
    planUpdates: true,
    electiveSuggestions: false,
  });

  const setToggle = (key: keyof typeof toggles, value: boolean) => {
    setToggles((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    if (!user) return;
    updateUser({
      ...user,
      email: profile.email,
      username: profile.username,
      displayName: profile.username.trim() || user.displayName,
    });
    // Sync local form edits into the UI cache; cookie remains source of auth.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to form field edits
  }, [profile.email, profile.username]);

  const setProfileField = (key: keyof typeof profile, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) => {
      const next = new Set(current);
      if (next.has(interest)) {
        next.delete(interest);
      } else {
        next.add(interest);
      }
      return next;
    });
  };

  const goToChat = () => navigate("/chat");

  const deleteSidebarChat = (id: string) => {
    setSidebarChats((current) => {
      const next = current.filter((chat) => chat.id !== id);
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.chats) ?? "[]") as Array<{ id?: string }>;
        localStorage.setItem(STORAGE_KEYS.chats, JSON.stringify(stored.filter((chat) => chat.id !== id)));
      } catch {
        localStorage.removeItem(STORAGE_KEYS.chats);
      }
      return next;
    });
  };

  const handleSaveGeminiKey = async () => {
    if (!geminiKey.trim()) return;
    setKeyStatus("saving");
    setKeyMessage("");
    try {
      await saveGeminiApiKey(geminiKey.trim());
      localStorage.setItem(STORAGE_KEYS.geminiKeyConfigured, "true");
      setGeminiKey("");
      setKeyStatus("saved");
      setKeyMessage("Key saved securely. New chats will use it immediately.");
    } catch (error) {
      setKeyStatus("error");
      setKeyMessage(error instanceof Error ? error.message : "Could not save the Gemini API key.");
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden font-['Montserrat',sans-serif]">
      <img
        src={imgBg}
        className="absolute inset-0 h-full w-full object-cover"
        alt=""
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 flex h-screen items-stretch gap-4 p-5">
        <div className="hidden h-full md:block">
          <CourseoSidebar
            chats={sidebarChats}
            activeChatId="settings"
            onNewChat={goToChat}
            onSelectChat={goToChat}
            onDeleteChat={deleteSidebarChat}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((value) => !value)}
            showHandbook={true}
            onHandbook={() => setShowHandbook(true)}
            onAccount={() => setShowAccount(true)}
            onHelp={() => setShowHelp(true)}
            onSettings={() => navigate("/settings")}
            activeUtility="settings"
          />
        </div>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[30px] bg-white shadow-[2px_2px_10px_3px_rgba(0,0,0,0.1)]">
          <div className="shrink-0 px-7 pt-6">
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
                  Manage your profile, integrations, and notifications.
                </p>
              </div>
            </div>
          </div>

          <div
            className="mt-5 flex shrink-0 gap-1 border-b border-[rgba(0,1,129,0.16)] px-7"
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
                  onClick={() => setActiveTab(tab.id)}
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

          <div className="flex-1 overflow-y-auto px-7 py-6">
            {activeTab === "profile" && (
              <div className="grid gap-5">
                <Panel
                  icon={<UserCircle size={20} strokeWidth={2.5} />}
                  title="Student profile"
                  description="Academic identity used for personalised planning"
                >
                  <SettingRow label="Email">
                    <TextInput
                      label="Email"
                      type="email"
                      value={profile.email}
                      placeholder="Enter your email"
                      onChange={(value) => setProfileField("email", value)}
                    />
                  </SettingRow>
                  <SettingRow label="Username">
                    <TextInput
                      label="Username"
                      value={profile.username}
                      placeholder="Enter your username"
                      onChange={(value) => setProfileField("username", value)}
                    />
                  </SettingRow>
                  <SettingRow label="Password">
                    <TextInput
                      label="Password"
                      type="password"
                      value={profile.password}
                      placeholder="Enter a new password"
                      onChange={(value) => setProfileField("password", value)}
                    />
                  </SettingRow>
                </Panel>

                <Panel
                  icon={<GraduationCap size={20} strokeWidth={2.5} />}
                  title="Degree & faculty"
                  description="Drives handbook grounding and curriculum validation"
                >
                  <SettingRow
                    label="Current degree"
                    sub="Used to select the correct handbook ruleset"
                  >
                    <Select
                      label="Degree selection"
                      value={degree}
                      onChange={setDegree}
                      options={["Bachelor of Computer Science"]}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Current major"
                    sub="Used to tune plan validation and elective recommendations"
                  >
                    <Select
                      label="Major selection"
                      value={major}
                      onChange={setMajor}
                      options={MAJORS}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Elective interests"
                    sub="Select areas for personalised elective suggestions"
                  />
                  <div className="flex flex-wrap gap-2 px-5 pb-5 pt-1" role="group" aria-label="Elective interests">
                    {ELECTIVE_INTERESTS.map((interest) => {
                      const selected = selectedInterests.has(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`rounded-full border px-4 py-2 text-[12px] font-extrabold transition-colors ${
                            selected
                              ? "border-[#000181] bg-[rgba(232,160,255,0.45)] text-[#000181]"
                              : "border-[rgba(0,1,129,0.18)] bg-[rgba(131,231,255,0.1)] text-[rgba(0,1,129,0.58)] hover:border-[#000181] hover:text-[#000181]"
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                  <div className="px-5 pb-5">
                    <input
                      aria-label="Additional elective interests"
                      type="text"
                      value={customInterest}
                      onChange={(event) => setCustomInterest(event.target.value)}
                      placeholder="Add another interest..."
                      className="h-10 w-full rounded-[14px] border border-[rgba(0,1,129,0.2)] bg-[rgba(131,231,255,0.1)] px-4 text-[13px] font-bold text-[#000181] outline-none placeholder:text-[rgba(0,1,129,0.38)] focus:border-[#000181]"
                    />
                  </div>
                </Panel>
              </div>
            )}

            {activeTab === "notifications" && (
              <Panel
                icon={<Bell size={20} strokeWidth={2.5} />}
                title="Notification preferences"
                description="When and how Courseo contacts you"
              >
                <SettingRow
                  label="Enrolment deadline reminders"
                  sub="Alert 2 weeks before each enrolment window opens"
                >
                  <Toggle
                    checked={toggles.deadlineReminders}
                    onChange={(value) => setToggle("deadlineReminders", value)}
                    label="Enrolment deadline reminders"
                  />
                </SettingRow>
                <SettingRow
                  label="Study plan updates"
                  sub="Notify when handbook changes affect saved plans"
                >
                  <Toggle
                    checked={toggles.planUpdates}
                    onChange={(value) => setToggle("planUpdates", value)}
                    label="Study plan updates"
                  />
                </SettingRow>
                <SettingRow
                  label="New elective suggestions"
                  sub="Weekly digest of newly matched electives for your interests"
                >
                  <Toggle
                    checked={toggles.electiveSuggestions}
                    onChange={(value) => setToggle("electiveSuggestions", value)}
                    label="New elective suggestions"
                  />
                </SettingRow>
                <SettingRow label="Notification channel">
                  <Select
                    label="Notification channel"
                    value={notificationChannel}
                    onChange={setNotificationChannel}
                    options={["In-app only", "Email", "Email + In-app"]}
                  />
                </SettingRow>
              </Panel>
            )}

            {activeTab === "system" && (
              <div className="grid gap-5">
                <Panel
                  icon={<KeyRound size={20} strokeWidth={2.5} />}
                  title="Google Gemini API key"
                  description="Connect Courseo to Gemini using your own key (currently supported provider)"
                >
                  <div className="space-y-4 px-5 py-5">
                    <div>
                      <label htmlFor="gemini-api-key" className="mb-2 block text-[13px] font-extrabold text-[#000181]">
                        API key
                      </label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          id="gemini-api-key"
                          type="password"
                          autoComplete="off"
                          value={geminiKey}
                          onChange={(event) => { setGeminiKey(event.target.value); setKeyStatus("idle"); }}
                          placeholder="Paste your Gemini API key"
                          className="h-11 min-w-0 flex-1 rounded-[14px] border border-[rgba(0,1,129,0.2)] bg-[rgba(131,231,255,0.1)] px-4 text-[13px] font-bold text-[#000181] outline-none focus:border-[#000181]"
                        />
                        <button
                          type="button"
                          onClick={() => void handleSaveGeminiKey()}
                          disabled={!geminiKey.trim() || keyStatus === "saving"}
                          className="h-11 rounded-[14px] bg-[#000181] px-5 text-[12px] font-extrabold text-white disabled:opacity-40"
                        >
                          {keyStatus === "saving" ? "Saving…" : "Save key"}
                        </button>
                      </div>
                      {keyMessage && <p role="status" className={`mt-2 text-[12px] font-semibold ${keyStatus === "error" ? "text-red-600" : "text-emerald-700"}`}>{keyMessage}</p>}
                      <p className="mt-2 text-[11px] font-semibold text-[rgba(0,1,129,0.52)]">
                        The key is written directly to <code>intelli-study-planner-brain/.env</code> and is never stored in the browser.
                      </p>
                    </div>

                    <div className="rounded-[16px] bg-[rgba(131,231,255,0.12)] p-4 text-[12px] font-semibold leading-relaxed text-[rgba(0,1,129,0.72)]">
                      <p className="mb-2 font-extrabold text-[#000181]">Step-by-step instructions</p>
                      <ol className="list-decimal space-y-2 pl-5">
                        <li><a className="font-extrabold text-[#000181] underline" href="https://aistudio.google.com/" target="_blank" rel="noreferrer">Sign in to Google AI Studio <ExternalLink className="inline" size={11} /></a> with your Google account and accept the developer terms if prompted.</li>
                        <li>Choose <strong>Get API key</strong> in the left sidebar.</li>
                        <li>Click the blue <strong>Create API key</strong> button in the top-right corner.</li>
                        <li>Choose a new project for the easiest setup, or select an existing Google Cloud project.</li>
                        <li>Copy the generated API key and keep a backup in a password manager.</li>
                      </ol>
                    </div>
                  </div>
                </Panel>

                <Panel
                  icon={<Server size={20} strokeWidth={2.5} />}
                  title="Microservice status"
                  description="Independently deployable service health"
                >
                  {["Planning Agent", "Validation Engine", "Data Sanitisation Engine"].map(
                    (service) => (
                      <SettingRow key={service} label={service}>
                        <Badge>
                          <Check size={12} strokeWidth={3} />
                          Online
                        </Badge>
                      </SettingRow>
                    )
                  )}
                  <SettingRow label="Handbook Sync">
                    <Badge tone="amber">Syncing</Badge>
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
                    sub="Permanently delete all generated and saved plans"
                  >
                    <DangerButton>Clear plans</DangerButton>
                  </SettingRow>
                  <SettingRow
                    label="Delete account"
                    sub="Remove your profile, enrolment record, and all data"
                  >
                    <DangerButton>Delete account</DangerButton>
                  </SettingRow>
                </Panel>
              </div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showHandbook && (
          <HandbookModal onClose={() => setShowHandbook(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAccount && (
          <AccountManagement onClose={() => setShowAccount(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHelp && (
          <HelpSlider onClose={() => setShowHelp(false)} />
        )}
      </AnimatePresence>



    </div>
  );
}
