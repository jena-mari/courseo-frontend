import { lazy, Suspense, useState, useRef, useEffect, useCallback, useMemo, type KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, ArrowRight, MoreVertical, Sparkles, PanelLeftOpen, PanelRightOpen, BookOpen
} from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import { CourseoSidebar, type Chat } from "../components/courseo-sidebar";
import { StudyPlan } from "../components/StudyPlan";
import { MessageRenderer } from "../components/message-renderer";
import { continueChat, generateChatTitle, startChat, type BackendMessage } from "../lib/chatApi";
import { STORAGE_KEYS } from "../lib/storageKeys";
import { getKeyProviders, personalKeyState, usableProviderModels, type ProviderModel } from "../lib/keyApi";
import { HelpSlider } from "../components/help-carousel";
import { AccountManagement } from "../components/AccountManagementPopup";
import { LlmPrivacyDisclosure } from "../components/LlmPrivacyDisclosure";
import { ApiKeyStatusNotice } from "../components/ApiKeyStatusNotice";
import { normalizeStudyPlanResponse, type StudyPlanResponse } from "../types/studyPlanType";
import textBounce from "../functions/textBounce";
import { ApiError } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

const StudyPlanDownload = lazy(() => import("../components/StudyPlanDownload"));

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  backendSessionId: string;
  title: string;
  messages: Message[];
  studyPlanData: StudyPlanResponse | null;
  model?: string;
}

export interface ExtractedAIContent {
  cleanText: string;
  studyPlanData: StudyPlanResponse | null;
}

const STUDY_PLAN_STARTER = "Create a study plan for me.";
const SUGGESTED_PROMPTS = [
  { text: STUDY_PLAN_STARTER, primary: true },
  { text: "What subjects should I take in the Autumn session this year?" },
  { text: "What should I study if I want to study game development?" },
  { text: "Am I allowed to take five subjects this semester?" },
];

function isProviderKeyError(error: unknown): error is ApiError {
  if (!(error instanceof ApiError)) return false;
  return [403, 409, 429].includes(error.status) || /api key|quota|rate limit|usage limit|billing|provider rejected/i.test(error.message);
}

function buildChatTitle(session: ChatSession) {
  const firstUserMessage = session.messages.find((message) => message.role === "user");

  const content = firstUserMessage?.content ?? session.messages[0]?.content ?? "New chat";
  const normalized = content
    .replace(/<[^>]*>/g, " ")
    .replace(/[`*_#>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.length > 42 ? `${normalized.slice(0, 42)}…` : normalized;
}

function parseAIResponse(aiResponseText: unknown): ExtractedAIContent {
  const emptyResult: ExtractedAIContent = {
    cleanText: "",
    studyPlanData: null,
  };
  if (!aiResponseText) return emptyResult;

  let originalText = "";

  if (typeof aiResponseText === "string") {
    originalText = aiResponseText;
  } else if (typeof aiResponseText === "object" && aiResponseText !== null) {
    const obj = aiResponseText as Record<string, unknown>;
    if (typeof obj.text === "string") {
      originalText = obj.text;
    } else {
      return emptyResult;
    }
  }

  if (!originalText) return emptyResult;

  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const jsonMatch = originalText.match(jsonRegex);
  let studyPlanData: StudyPlanResponse | null = null;

  if (jsonMatch?.[1]) {
    try {
      const parsedPlan: unknown = JSON.parse(jsonMatch[1].trim());
      const normalizedPlan = normalizeStudyPlanResponse(parsedPlan);
      console.log(normalizedPlan)
      if (normalizedPlan) {
        studyPlanData = normalizedPlan;
      } else {
        console.warn("Ignored an assistant study plan with an invalid structure.");
      }
    } catch (error) {
      console.error("Failed to parse extracted Study Plan JSON:", error);
    }
  }

  return {
    cleanText: originalText.replace(jsonRegex, "").trim(),
    studyPlanData,
  };
}

function toFrontendMessage(message: BackendMessage): Message {
  const parsed = parseAIResponse(message.content);

  return {
    id: String(message.id),
    role: message.role === "user" ? "user" : "assistant",
    content: parsed.cleanText,
    timestamp: new Date(message.created_at),
  };
}

function loadInitialChats(): ChatSession[] {
  let savedChats: ChatSession[] = [];
  const savedChatsRaw = localStorage.getItem(STORAGE_KEYS.chats);

  if (savedChatsRaw) {
    try {
      const parsedChats = JSON.parse(savedChatsRaw) as ChatSession[];
      savedChats = parsedChats
        .filter((chat) => chat.backendSessionId)
        .map((chat) => ({
          ...chat,
          studyPlanData: chat.studyPlanData ?? null,
          messages: chat.messages.map((message) => ({
            ...message,
            timestamp: new Date(message.timestamp),
          })),
        }));
    } catch {
      localStorage.removeItem(STORAGE_KEYS.chats);
    }
  }

  const bootstrapRaw = localStorage.getItem(STORAGE_KEYS.bootstrapChat);
  if (!bootstrapRaw) return savedChats;

  try {
    const bootstrap = JSON.parse(bootstrapRaw) as {
      sessionId: string;
      reply: BackendMessage;
    };
    const parsedReply = parseAIResponse(bootstrap.reply.content);
    const bootstrapChat: ChatSession = {
      id: bootstrap.sessionId,
      backendSessionId: bootstrap.sessionId,
      title: "My study plan",
      messages: [toFrontendMessage(bootstrap.reply)],
      studyPlanData: parsedReply.studyPlanData,
    };

    return [
      bootstrapChat,
      ...savedChats.filter(
        (chat) => chat.backendSessionId !== bootstrap.sessionId
      ),
    ];
  } catch {
    localStorage.removeItem(STORAGE_KEYS.bootstrapChat);
    return savedChats;
  }
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="w-8 h-8 rounded-full bg-[rgba(131,231,255,0.5)] flex items-center justify-center shrink-0">
        <Sparkles size={14} className="text-[#000181]" />
      </div>
      <div className="bg-[rgba(131,231,255,0.15)] border border-[rgba(0,1,129,0.1)] rounded-[20px] rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[rgba(0,1,129,0.5)]"
              animate={{ y: ["0%", "-60%", "0%"] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={`flex ${isUser ? "justify-end" : "items-end gap-3"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[rgba(131,231,255,0.5)] flex items-center justify-center shrink-0 mb-1">
          <Sparkles size={14} className="text-[#000181]" />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-[20px] px-5 py-3 text-[14px] font-['Montserrat',sans-serif] ${
          isUser
            ? "bg-[#000181] text-white rounded-br-sm"
            : "bg-[rgba(131,231,255,0.15)] border border-[rgba(0,1,129,0.1)] text-[#000181] rounded-bl-sm"
        }`}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <MessageRenderer content={message.content} />
        )}
      </div>
    </motion.div>
  );
}

export function ChatPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const location = useLocation();
  const enrollment = localStorage.getItem(STORAGE_KEYS.enrolment) ?? "";
  const initialChats = useMemo(loadInitialChats, []);
  const initialActiveChat = initialChats[0];

  const [chats, setChats] = useState<ChatSession[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string>(
    initialActiveChat?.id ?? "new"
  );
  const [activeMessages, setActiveMessages] = useState<Message[]>(
    initialActiveChat?.messages ?? []
  );
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [chatError, setChatError] = useState("");
  const [availableModels, setAvailableModels] = useState<Array<ProviderModel & { provider: string; providerLabel: string }>>([]);
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem(STORAGE_KEYS.selectedModel) ?? "");
  const [keyStatus, setKeyStatus] = useState<"checking" | "ready" | "invalid" | "missing" | "error">("checking");
  const [showKeyNotice, setShowKeyNotice] = useState(false);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(() => Boolean(user?.id && localStorage.getItem(STORAGE_KEYS.llmPrivacyAcknowledged) === user.id));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [studyPlanCollapsed, setStudyPlanCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileStudyPlanOpen, setMobileStudyPlanOpen] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [studyPlanData, setStudyPlanData] = useState<StudyPlanResponse | null>(
    initialActiveChat?.studyPlanData ?? null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendingPromptSentRef = useRef(false);
  const handbookHref = `https://courses.uow.edu.au/courses/${user?.commencementYear ?? new Date().getFullYear()}/${user?.degreeCode ?? "766"}`;

  useEffect(() => {
    setPrivacyAcknowledged(Boolean(user?.id && localStorage.getItem(STORAGE_KEYS.llmPrivacyAcknowledged) === user.id));
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
        if (next) localStorage.setItem(STORAGE_KEYS.selectedModel, next);
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
    localStorage.setItem(STORAGE_KEYS.llmPrivacyAcknowledged, user.id);
    setPrivacyAcknowledged(true);
  };

  const changeModel = (model: string) => {
    setSelectedModel(model);
    localStorage.setItem(STORAGE_KEYS.selectedModel, model);
  };

  const setSmartTitle = useCallback((chatId: string) => {
    void generateChatTitle(chatId, selectedModel)
      .then((title) => {
        if (!title) return;
        setChats((current) => current.map((chat) => chat.id === chatId ? { ...chat, title } : chat));
      })
      .catch(() => {
        // The readable local title remains in place if Gemini is unavailable.
      });
  }, [selectedModel]);
  useEffect(() => {
    if (activeChatId === "new") {
      setActiveMessages([]);
      setStudyPlanData(null);
    } else {
      const found = chats.find((c) => c.id === activeChatId);
      setActiveMessages(found?.messages ?? []);
      setStudyPlanData(found?.studyPlanData ?? null);
    }
  }, [activeChatId, chats]);

  useEffect(() => {
    if (location.pathname !== "/chat") return;
    localStorage.setItem(STORAGE_KEYS.chats, JSON.stringify(chats));
    localStorage.removeItem(STORAGE_KEYS.bootstrapChat);
  }, [chats, location.pathname]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, isTyping]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping || !requireChatAccess()) return;

      const activeChat = chats.find((chat) => chat.id === activeChatId);
      if (!activeChat?.backendSessionId) {
        setChatError(
          enrollment
            ? "Create a new chat before sending a message."
            : "Add your enrolment record before starting a study-planning chat."
        );
        return;
      }

      setChatError("");
      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      const newMessages = [...activeMessages, userMsg];
      setActiveMessages(newMessages);
      setInputText("");
      setIsTyping(true);

      setChats((previousChats) =>
        previousChats.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                title: chat.title,
                messages: newMessages,
              }
            : chat
        )
      );

      try {
        const data = await continueChat(activeChat.backendSessionId, trimmed, activeChat.model || selectedModel || undefined);
        const content = parseAIResponse(data.reply.content);

        if (content.studyPlanData) {
          setStudyPlanData(content.studyPlanData);
        }

        const aiMsg: Message = {
          id: String(data.reply.id),
          role: "assistant",
          content: content.cleanText,
          timestamp: new Date(data.reply.created_at),
        };

        const finalMessages = [...newMessages, aiMsg];
        setActiveMessages(finalMessages);

        setChats((previousChats) =>
          previousChats.map((chat) =>
            chat.id === activeChat.id
              ? {
                  ...chat,
                  title: chat.title,
                  messages: finalMessages,
                  studyPlanData:
                    content.studyPlanData ?? chat.studyPlanData,
                }
              : chat
          )
        );
        if (["New study plan", "My study plan", "New chat", "UOW Course Planning and Study Guide"].includes(activeChat.title)) {
          setSmartTitle(activeChat.backendSessionId);
        }
      } catch (error) {
        if (isProviderKeyError(error)) {
          await handleUnavailableKey(error.message);
          return;
        }
        const errorText =
          error instanceof Error
            ? error.message
            : "Courseo could not complete that request.";
        setChatError(errorText);

        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: errorText,
          timestamp: new Date(),
        };
        const failedMessages = [...newMessages, errorMessage];
        setActiveMessages(failedMessages);
        setChats((previousChats) =>
          previousChats.map((chat) =>
            chat.id === activeChat.id
              ? { ...chat, messages: failedMessages }
              : chat
          )
        );
      } finally {
        setIsTyping(false);
      }
    },
    [activeMessages, activeChatId, chats, enrollment, handleUnavailableKey, isTyping, requireChatAccess, selectedModel, setSmartTitle]
  );

  useEffect(() => {
    if (
      location.pathname !== "/chat" ||
      pendingPromptSentRef.current ||
      isTyping ||
      !privacyAcknowledged
    ) {
      return;
    }
    const pendingPrompt = localStorage.getItem(STORAGE_KEYS.pendingPrompt);
    if (!pendingPrompt) return;
    pendingPromptSentRef.current = true;
    localStorage.removeItem(STORAGE_KEYS.pendingPrompt);
    void sendMessage(pendingPrompt);
  }, [isTyping, location.pathname, privacyAcknowledged, sendMessage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const activeChat = chats.find((chat) => chat.id === activeChatId);
      if (!activeChat?.backendSessionId) {
        handleNewChatNoEnrol(inputText);
      }
      else { sendMessage(inputText); }
    }
  };

  const handleNewChatNoEnrol = async (prompt : string) => {
    const trimmed = prompt.trim();
    if (!trimmed || isTyping || !requireChatAccess()) return;

    setChatError("");
    setShowMenu(false);

    if (isCreatingChat) return;
    setIsCreatingChat(true);

    //user message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setActiveMessages([userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const requestPrompt = trimmed === STUDY_PLAN_STARTER
        ? `${trimmed}\n\nBefore creating the plan, ask me to copy and paste my enrolment record from SOLS.`
        : trimmed;
      const result = await startChat(requestPrompt, selectedModel || undefined);
      const parsedReply = parseAIResponse(result.reply.content);

      const aiMsg: Message = {
          id: String(result.reply.id),
          role: "assistant",
          content: parsedReply.cleanText,
          timestamp: new Date(result.reply.created_at),
        };

      const chatMessages = [userMsg, aiMsg];

      const newChat: ChatSession = {
        id: result.session_id,
        backendSessionId: result.session_id,
        title: buildChatTitle({
          id: result.session_id,
          backendSessionId: result.session_id,
          title: "New chat",
          messages: chatMessages,
          studyPlanData: parsedReply.studyPlanData,
        }),
        messages: chatMessages,
        // messages: [toFrontendMessage(result.reply)],
        studyPlanData: parsedReply.studyPlanData,
        model: selectedModel || undefined,
      };

      setChats((existingChats) => [newChat, ...existingChats]);
      setActiveChatId(newChat.id);
      setActiveMessages(newChat.messages);
      setStudyPlanData(newChat.studyPlanData);
      // setInputText("");
      setChatError("");
      setSmartTitle(newChat.id);

    } catch (error) {
      if (isProviderKeyError(error)) {
        await handleUnavailableKey(error.message);
        return;
      }
      setChatError(
        error instanceof Error
          ? error.message
          : "Courseo could not create a new chat."
      );
    } finally {
      setIsCreatingChat(false);
      setIsTyping(false);
    }
  };

  const handleNewChat = async () => {
    if (!requireChatAccess()) return;
    setShowMenu(false);
    setChatError("");

    if (!enrollment) {
      // navigate("/");
      localStorage.setItem(STORAGE_KEYS.enrolment, " ");
      return;
    }

    if (isCreatingChat) return;
    setIsCreatingChat(true);

    try {
      setActiveMessages([]);
      // if (enrollment != " ") {
        
      // }
      const result = await startChat(enrollment, selectedModel || undefined);
      const parsedReply = parseAIResponse(result.reply.content);
      const newChat: ChatSession = {
        id: result.session_id,
        backendSessionId: result.session_id,
        title: "New study plan",
        messages: [toFrontendMessage(result.reply)],
        studyPlanData: parsedReply.studyPlanData,
        model: selectedModel || undefined,
      };

      setChats((existingChats) => [newChat, ...existingChats]);
      setActiveChatId(newChat.id);
      setActiveMessages(newChat.messages);
      setStudyPlanData(newChat.studyPlanData);
      setInputText("");
      setChatError("");
      setSmartTitle(newChat.id);

    } catch (error) {
      if (isProviderKeyError(error)) {
        await handleUnavailableKey(error.message);
        return;
      }
      setChatError(
        error instanceof Error
          ? error.message
          : "Courseo could not create a new chat."
      );
    } finally {
      setIsCreatingChat(false);
    }
  };

  const fillComposer = (prompt: string) => {
    setInputText(prompt);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const submitComposer = () => {
    const activeChat = chats.find((chat) => chat.id === activeChatId);
    if (activeChat?.backendSessionId) void sendMessage(inputText);
    else void handleNewChatNoEnrol(inputText);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    const found = chats.find((c) => c.id === id);
    setActiveMessages(found?.messages ?? []);
    setStudyPlanData(found?.studyPlanData ?? null);
    setChatError("");
  };

  const handleDeleteChat = (id: string) => {
    const remainingChats = chats.filter((chat) => chat.id !== id);
    setChats(remainingChats);

    if (id === activeChatId) {
      const nextChat = remainingChats[0];
      setActiveChatId(nextChat?.id ?? "new");
      setActiveMessages(nextChat?.messages ?? []);
      setStudyPlanData(nextChat?.studyPlanData ?? null);
    }

    setChatError("");
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setShowMenu(false);
    try { await logout(); } finally { navigate("/"); setIsLoggingOut(false); }
  };

  const isEmptyChat = activeMessages.length === 0;

  const sidebarChats: Chat[] = chats.map((c) => ({
    id: c.id,
    title: c.title || buildChatTitle(c),
  }));

  if (isLoggingOut) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#f7f8ff] font-['Montserrat',sans-serif] text-[#000181]" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
          <svg className="h-10 w-10" viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#dfe1f5" strokeWidth="4" />
            <path d="M20 4a16 16 0 0 1 16 16" fill="none" stroke="#000181" strokeWidth="4" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="0.75s" repeatCount="indefinite" />
            </path>
          </svg>
          <p className="text-[13px] font-extrabold">Logging out securely…</p>
        </div>
      </div>
    );
  }


  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden font-['Montserrat',sans-serif]"
    >
      <img
        src={imgBg}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        alt=""
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      <div className="relative z-10 flex items-stretch gap-3 xl:gap-4 p-2.5 sm:p-4 xl:p-5 h-[100dvh]">
        <div className="hidden md:block h-full">
          <CourseoSidebar
          chats={sidebarChats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          onAccount={() => setShowAccount(true)}
          onHelp={() => setShowHelp(true)}
          onSettings={() => navigate("/settings")}
          onApiKeys={() => navigate("/settings?tab=system#api-keys")}
          />
        </div>

        <main className="flex-1 bg-white rounded-[22px] sm:rounded-[26px] xl:rounded-[30px] shadow-[2px_2px_10px_3px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden min-w-0">
          <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 shrink-0">
            <div className="flex min-w-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-[#000181] hover:bg-gray-100 transition-colors"
                aria-label="Open navigation"
              >
                <PanelLeftOpen size={21} />
              </button>
              <p className="font-extrabold text-xl sm:text-2xl text-[#000181] tracking-[-0.96px]">
                Courseo
              </p>
              {availableModels.length > 0 && (
                <select
                  aria-label="AI model"
                  value={selectedModel}
                  onChange={(event) => changeModel(event.target.value)}
                  className="ml-2 hidden h-9 max-w-[220px] rounded-[11px] border border-[rgba(0,1,129,0.16)] bg-[#f7f8ff] px-3 text-[11px] font-extrabold text-[#000181] outline-none sm:block"
                >
                  {availableModels.map((model) => <option key={model.name} value={model.name}>{model.label} · {model.providerLabel}</option>)}
                </select>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMobileStudyPlanOpen(true)}
                className="xl:hidden w-10 h-10 flex items-center justify-center rounded-xl text-[#000181] hover:bg-gray-100 transition-colors"
                aria-label="Open study plan"
              >
                <PanelRightOpen size={21} />
              </button>
              <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-[#000181]"
              >
                <MoreVertical size={22} />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-44 z-10"
                  >
                    {[
                      {
                        label: isCreatingChat ? "Creating Chat…" : "New Chat",
                        action: () => void handleNewChat(),
                      },
                      { label: "Handbook →", action: () => { window.open(handbookHref, "_blank", "noopener,noreferrer"); setShowMenu(false); } },
                      { label: "Settings", action: () => navigate("/settings") },
                      {
                        label: enrollment ? "Update Enrolment" : "Add Enrolment",
                        action: () => navigate("/"),
                      },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="w-full text-left px-4 py-2 text-[13px] font-semibold text-[#000181] hover:bg-[rgba(131,231,255,0.2)] transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                    <div className="my-1 border-t border-gray-100" />
                    <button type="button" onClick={() => void handleLogout()} disabled={isLoggingOut} className="w-full px-4 py-2 text-left text-[13px] font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50">{isLoggingOut ? "Logging out…" : "Log out"}</button>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </div>
          </div>

          {/* <Slider onClose={() => setShowHelp(false)}></Slider> */}

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 min-h-0">
            {isEmptyChat ? (
              <>
              {isCreatingChat ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center h-full min-h-[200px] max-w-50px mx-auto"
                >
                  {textBounce("Creating new chat...", "font-bold max-w-[80%] text-[clamp(36px,6vw,68px)] text-[#000181] text-center tracking-[-2.5px] leading-[0.98] mb-4", -15)}
                </motion.div>

              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center h-full min-h-[200px] max-w-3xl mx-auto"
                >
                  <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="font-extrabold text-[clamp(38px,6vw,68px)] text-[#000181] text-center tracking-[-2.5px] leading-[0.98] mb-4"
                  >
                    How can I help?
                  </motion.h1>
                  {enrollment && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-[13px] font-semibold text-[rgba(0,1,129,0.5)] mb-6 text-center max-w-sm"
                    >
                      ✅ Enrolment record loaded — I'm ready to help you plan your studies
                    </motion.p>
                  )}
                </motion.div>
              )} 
            </> 
            ) : (
              <div className="flex flex-col gap-5 py-4 w-full max-w-3xl mx-auto">
                {activeMessages.map((msg, i) => (
                  <MessageBubble key={msg.id} message={msg} index={i} />
                ))}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                    >
                      <TypingIndicator />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <AnimatePresence>
            {isEmptyChat && !isCreatingChat && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.2 }}
                className="mx-auto flex max-h-[240px] w-full max-w-[816px] shrink-0 flex-col gap-2 overflow-auto px-4 pb-3 sm:px-6"
              >
                <div className="mb-1 flex items-center justify-between gap-3 rounded-[14px] border border-[rgba(0,1,129,0.12)] bg-white/80 px-3 py-2.5">
                  <span className="flex min-w-0 items-center gap-2 text-[11px] font-bold leading-relaxed text-[rgba(0,1,129,0.65)]"><BookOpen size={16} className="shrink-0 text-[#000181]" /> Get your enrolment record from SOLS before Courseo builds your plan.</span>
                  <button type="button" onClick={() => setShowHelp(true)} className="shrink-0 rounded-[10px] bg-[#eef0ff] px-3 py-2 text-[10px] font-extrabold text-[#000181] transition hover:bg-[#e1e4ff]">View instructions</button>
                </div>
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <motion.button
                    key={prompt.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => fillComposer(prompt.text)}
                    className={prompt.primary
                      ? "rounded-[16px] bg-[#000181] px-4 py-3.5 text-left text-[14px] font-extrabold text-white shadow-[0_8px_22px_rgba(0,1,129,0.2)] transition hover:bg-[#171899]"
                      : "rounded-[15px] border border-[rgba(0,1,129,0.12)] bg-[#eafaff] px-4 py-2.5 text-left text-[12px] font-extrabold text-[rgba(0,1,129,0.72)] transition-colors hover:bg-[#d8f7ff]"}
                  >
                    {prompt.text}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-3 sm:px-6 pb-3 sm:pb-5 shrink-0">
            {chatError && (
              <p
                role="alert"
                className="w-full max-w-3xl mx-auto mb-2 px-2 text-[12px] font-semibold text-red-600"
              >
                {chatError}
              </p>
            )}

            {/*button to download study plan*/}
            {studyPlanData && (
              <div className="flex justify-end gap-2 px-1 py-3 w-full max-w-3xl mx-auto">
                <Suspense fallback={<span className="h-9 rounded-[15px] bg-[#f1e8ff] px-5 text-[11px] font-extrabold leading-9 text-[#000181]">Preparing download…</span>}>
                  <StudyPlanDownload studyPlan={studyPlanData} />
                </Suspense>
              </div>
            )}
            
            
            <div className="border border-[rgba(0,50,252,0.65)] rounded-[24px] sm:rounded-[28px] shadow-[0_4px_18px_rgba(0,1,129,0.1)] flex flex-col gap-2 px-4 py-3 w-full max-w-3xl mx-auto">
              <textarea
                ref={inputRef}
                rows={1}
                placeholder="Start typing..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={keyStatus !== "ready"}
                className="flex-1 resize-none text-[16px] font-semibold text-[rgba(0,1,129,0.72)] placeholder:text-[rgba(0,1,129,0.4)] outline-none bg-transparent leading-snug overflow-hidden w-full"
                style={{ minHeight: "1.6em", maxHeight: "8em" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = el.scrollHeight + "px";
                }}
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={() => undefined}
                  className="text-[#000181] hover:bg-[rgba(0,1,129,0.08)] p-1.5 rounded-lg transition-colors"
                  title="Attach file"
                >
                  <Plus size={22} />
                </button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={submitComposer}
                  disabled={!inputText.trim() || isTyping || keyStatus !== "ready"}
                  className="w-8 h-8 rounded-full bg-[#000181] flex items-center justify-center disabled:opacity-40 transition-opacity"
                  title="Send"
                >
                  <ArrowRight size={14} className="text-white" />
                </motion.button>
              </div>
            </div>
          </div>
        </main>

        <div className="hidden xl:block h-full">
          <StudyPlan
            collapsed={studyPlanCollapsed}
            onToggle={() => setStudyPlanCollapsed((v) => !v)}
            studyPlanInput={studyPlanData}
          />
        </div>
      </div>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#050515]/45 backdrop-blur-[2px] md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="h-full p-2.5"
              onClick={(event) => event.stopPropagation()}
            >
              <CourseoSidebar
                chats={sidebarChats}
                activeChatId={activeChatId}
                onNewChat={() => {
                  setMobileSidebarOpen(false);
                  void handleNewChat();
                }}
                onSelectChat={(id) => {
                  handleSelectChat(id);
                  setMobileSidebarOpen(false);
                }}
                onDeleteChat={handleDeleteChat}
                onToggle={() => setMobileSidebarOpen(false)}
                expandedWidth="min(86vw, 320px)"
                onAccount={() => {
                  setMobileSidebarOpen(false);
                  setShowAccount(true);
                }}
                onHelp={() => {
                  setMobileSidebarOpen(false);
                  setShowHelp(true);
                }}
                onSettings={() => navigate("/settings")}
                onApiKeys={() => navigate("/settings?tab=system#api-keys")}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileStudyPlanOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex justify-end bg-[#050515]/45 backdrop-blur-[2px] xl:hidden"
            onClick={() => setMobileStudyPlanOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="h-full p-2.5"
              onClick={(event) => event.stopPropagation()}
            >
              <StudyPlan
                onToggle={() => setMobileStudyPlanOpen(false)}
                expandedWidth="min(92vw, 360px)"
                studyPlanInput={studyPlanData}
              />
            </motion.div>
          </motion.div>
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

      <AnimatePresence>
        {user && !privacyAcknowledged && keyStatus === "ready" && (
          <LlmPrivacyDisclosure onAcknowledge={acknowledgePrivacy} onLeave={() => navigate("/")} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showKeyNotice && (
          <ApiKeyStatusNotice
            message="Your saved key could not be verified or may have reached its limit. Update or re-check it before sending another message."
            onAction={() => navigate("/settings?tab=system#api-keys")}
            onDismiss={() => setShowKeyNotice(false)}
          />
        )}
      </AnimatePresence>

      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
