import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Brain,
  Check,
  GraduationCap,
  Server,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import { CourseoSidebar, type Chat } from "../components/courseo-sidebar";
import { HelpSlider } from "../components/help-carousel";
import { AccountAccessPopup } from "../components/AccountAccessPopup";
import { HandbookModal } from "../components/HandbookModalPopup";
import { getAuthSession, updateAuthSessionUser } from "../lib/authSession";
import { STORAGE_KEYS } from "../lib/storageKeys";
import { getServiceHealth, type CourseoServiceHealth } from "../lib/serviceHealth";

type SettingsTab = "profile" | "ai" | "notifications" | "system";

const TABS: Array<{ id: SettingsTab; label: string }> = [
  { id: "profile", label: "Profile & Degree" },
  { id: "ai", label: "AI & Planning" },
  { id: "notifications", label: "Notifications" },
  { id: "system", label: "System" },
];

function getStoredChats(): Chat[] {
  const raw = localStorage.getItem(STORAGE_KEYS.chats);
  if (!raw) return [];

  try {
    const chats = JSON.parse(raw) as Array<{ id?: unknown; title?: unknown }>;
    if (!Array.isArray(chats)) return [];
    return chats.flatMap((chat) =>
      typeof chat.id === "string" && typeof chat.title === "string"
        ? [{ id: chat.id, title: chat.title }]
        : []
    );
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

function getStoredProfile() {
  const user = getAuthSession()?.user;
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
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [showAccount, setShowAccount] = useState(false);
  const [showHandbook, setShowHandbook] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarChats] = useState<Chat[]>(getStoredChats);
  const [serviceHealth, setServiceHealthState] =
    useState<CourseoServiceHealth>(getServiceHealth);
  const [profile, setProfile] = useState(getStoredProfile);
  const [degree, setDegree] = useState("Bachelor of Computer Science");
  const [major, setMajor] = useState("Artificial Intelligence and Big Data");
  const [planningModel, setPlanningModel] = useState("Balanced (default)");
  const [handbookVersion, setHandbookVersion] = useState("2026 (current)");
  const [notificationChannel, setNotificationChannel] = useState("In-app only");
  const [customInterest, setCustomInterest] = useState("");
  const [selectedInterests, setSelectedInterests] = useState(
    () => new Set(["Machine Learning", "Cybersecurity", "Cloud Computing"])
  );
  const [toggles, setToggles] = useState({
    strictPrerequisites: true,
    careerWeighting: true,
    validationReasoning: false,
    stripIdentifiers: true,
    deadlineReminders: true,
    planUpdates: true,
    electiveSuggestions: false,
  });

  const setToggle = (key: keyof typeof toggles, value: boolean) => {
    setToggles((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    const current = getAuthSession()?.user;
    if (!current) return;
    updateAuthSessionUser({
      ...current,
      email: profile.email,
      username: profile.username,
    });
  }, [profile.email, profile.username]);

  useEffect(() => {
    const updateHealth = () => setServiceHealthState(getServiceHealth());
    window.addEventListener("courseo:service-health", updateHealth);
    window.addEventListener("storage", updateHealth);
    return () => {
      window.removeEventListener("courseo:service-health", updateHealth);
      window.removeEventListener("storage", updateHealth);
    };
  }, []);

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
            onNewChat={goToChat}
            onSelectChat={(id) => navigate("/chat", { state: { chatId: id } })}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((value) => !value)}
            showHandbook={true}
            onHandbook={() => setShowHandbook(true)}
            onAccount={() => setShowAccount(true)}
            onHelp={() => setShowHelp(true)}
            onSettings={() => navigate("/settings")}
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
                  Manage profile, degree details, planning behaviour, and notifications.
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

            {activeTab === "ai" && (
              <div className="grid gap-5">
                <Panel
                  icon={<Brain size={20} strokeWidth={2.5} />}
                  title="LLM planning behaviour"
                  description="Control how the AI agent generates study plans"
                >
                  <SettingRow
                    label="Planning model"
                    sub="LangGraph agent used for semester-by-semester generation"
                  >
                    <Select
                      label="Planning model"
                      value={planningModel}
                      onChange={setPlanningModel}
                      options={[
                        "Balanced (default)",
                        "Faster (fewer passes)",
                        "Thorough (more validation)",
                      ]}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Strict prerequisite enforcement"
                    sub="Block subjects where prerequisites are unmet"
                  >
                    <Toggle
                      checked={toggles.strictPrerequisites}
                      onChange={(value) => setToggle("strictPrerequisites", value)}
                      label="Strict prerequisite enforcement"
                    />
                  </SettingRow>
                  <SettingRow
                    label="Career pathway weighting"
                    sub="Bias elective picks toward stated career goals"
                  >
                    <Toggle
                      checked={toggles.careerWeighting}
                      onChange={(value) => setToggle("careerWeighting", value)}
                      label="Career pathway weighting"
                    />
                  </SettingRow>
                  <SettingRow
                    label="Show validation reasoning"
                    sub="Display rule-check explanations alongside generated plans"
                  >
                    <Toggle
                      checked={toggles.validationReasoning}
                      onChange={(value) => setToggle("validationReasoning", value)}
                      label="Show validation reasoning"
                    />
                  </SettingRow>
                </Panel>

                <Panel
                  icon={<ShieldCheck size={20} strokeWidth={2.5} />}
                  title="Data sanitisation"
                  description="Clean copied enrolment text before AI processing"
                >
                  <SettingRow
                    label="Strip personal identifiers"
                    sub="Remove personal details from pasted enrolment records before LLM ingestion"
                  >
                    <Toggle
                      checked={toggles.stripIdentifiers}
                      onChange={(value) => setToggle("stripIdentifiers", value)}
                      label="Strip personal identifiers"
                    />
                  </SettingRow>
                  <SettingRow
                    label="Handbook version"
                    sub="Pinned ruleset for curriculum compliance checks"
                  >
                    <Select
                      label="Handbook version"
                      value={handbookVersion}
                      onChange={setHandbookVersion}
                      options={["2026 (current)", "2025", "2024"]}
                    />
                  </SettingRow>
                  <SettingRow label="Service status" sub={serviceHealth.message}>
                    <Badge tone={serviceHealth.chatApi === "operational" ? "cyan" : "red"}>
                      {serviceHealth.chatApi === "operational" ? (
                        <Check size={12} strokeWidth={3} />
                      ) : (
                        <AlertTriangle size={12} strokeWidth={3} />
                      )}
                      {serviceHealth.chatApi === "operational" ? "Online" : "Unavailable"}
                    </Badge>
                  </SettingRow>
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
                  icon={<Server size={20} strokeWidth={2.5} />}
                  title="Microservice status"
                  description="Independently deployable service health"
                >
                  {["Planning Agent", "Validation Engine", "Data Sanitisation Engine"].map(
                    (service) => (
                      <SettingRow
                        key={service}
                        label={service}
                        sub={serviceHealth.chatApi === "unavailable" ? serviceHealth.message : undefined}
                      >
                        <Badge tone={serviceHealth.chatApi === "operational" ? "cyan" : "red"}>
                          {serviceHealth.chatApi === "operational" ? (
                            <Check size={12} strokeWidth={3} />
                          ) : (
                            <AlertTriangle size={12} strokeWidth={3} />
                          )}
                          {serviceHealth.chatApi === "operational" ? "Online" : "Unavailable"}
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
          <AccountAccessPopup onClose={() => setShowAccount(false)} />
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
