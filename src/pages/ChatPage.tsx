import { useState, useRef, useEffect, useCallback, useMemo, type KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, ArrowRight, MoreVertical, Sparkles, PanelLeftOpen, PanelRightOpen, FileDown
} from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import { CourseoSidebar, type Chat } from "../components/courseo-sidebar";
import { StudyPlan } from "../components/StudyPlan";
import { MessageRenderer } from "../components/message-renderer";
import { continueChat, startChat, type BackendMessage } from "../lib/chatApi";
import { clearAuthSession } from "../lib/authSession";
import { clearCourseoStorage, STORAGE_KEYS } from "../lib/storageKeys";
import { HelpSlider } from "../components/help-carousel";
import { AccountAccessPopup } from "../components/AccountAccessPopup";
import { HandbookModal } from "../components/HandbookModalPopup";
import { normalizeStudyPlanResponse, type StudyPlanResponse } from "../types/studyPlanType";
import textBounce from "../functions/textBounce";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import MyDocument from "../functions/pdf";

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
}

export interface ExtractedAIContent {
  cleanText: string;
  studyPlanData: StudyPlanResponse | null;
}

const SUGGESTED_PROMPTS = [
  '"What subjects should I take in the Autumn session this year?"',
  '"What should I study if I want to study game development?"',
  '"Am I allowed to take five subjects this semester?"',
];

function buildChatTitle(session: ChatSession) {
  const lastUserMessage = [...session.messages]
    .reverse()
    .find((message) => message.role === "user");

  const content = lastUserMessage?.content ?? session.messages[0]?.content ?? "New Chat";
  const normalized = content.replace(/\s+/g, " ").trim();
  return normalized.length > 38 ? `${normalized.slice(0, 38)}…` : normalized;
}

function parseAIResponse(aiResponseText: unknown): ExtractedAIContent {
  const fallbackResult: ExtractedAIContent = {
    cleanText: "",
    studyPlanData: null,
  };
  if (!aiResponseText) return fallbackResult;

  let originalText = "";

  if (typeof aiResponseText === "string") {
    originalText = aiResponseText;
  } else if (typeof aiResponseText === "object" && aiResponseText !== null) {
    const obj = aiResponseText as Record<string, unknown>;
    if (typeof obj.text === "string") {
      originalText = obj.text;
    } else {
      return fallbackResult;
    }
  }

  if (!originalText) return fallbackResult;

  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const jsonMatch = originalText.match(jsonRegex);
  let studyPlanData: StudyPlanResponse | null = null;

  if (jsonMatch?.[1]) {
    try {
      const parsedPlan: unknown = JSON.parse(jsonMatch[1].trim());
      const normalizedPlan = normalizeStudyPlanResponse(parsedPlan);
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
  const location = useLocation();
  const enrollment = localStorage.getItem(STORAGE_KEYS.enrolment) ?? "";
  const initialChats = useMemo(loadInitialChats, []);
  const requestedChatId = (location.state as { chatId?: unknown } | null)?.chatId;
  const initialActiveChat =
    initialChats.find((chat) => chat.id === requestedChatId) ?? initialChats[0];

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [studyPlanCollapsed, setStudyPlanCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileStudyPlanOpen, setMobileStudyPlanOpen] = useState(false);
  const [showHandbook, setShowHandbook] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [studyPlanData, setStudyPlanData] = useState<StudyPlanResponse | null>(
    initialActiveChat?.studyPlanData ?? null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendingPromptSentRef = useRef(false);
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
      if (!trimmed || isTyping) return;

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
                title: buildChatTitle({ ...chat, messages: newMessages }),
                messages: newMessages,
              }
            : chat
        )
      );

      try {
        const data = await continueChat(activeChat.backendSessionId, trimmed);
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
                  title: buildChatTitle({
                    ...chat,
                    messages: finalMessages,
                  }),
                  messages: finalMessages,
                  studyPlanData:
                    content.studyPlanData ?? chat.studyPlanData,
                }
              : chat
          )
        );
      } catch (error) {
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
    [activeMessages, activeChatId, chats, enrollment, isTyping]
  );

  useEffect(() => {
    if (
      location.pathname !== "/chat" ||
      pendingPromptSentRef.current ||
      isTyping
    ) {
      return;
    }
    const pendingPrompt = localStorage.getItem(STORAGE_KEYS.pendingPrompt);
    if (!pendingPrompt) return;
    pendingPromptSentRef.current = true;
    localStorage.removeItem(STORAGE_KEYS.pendingPrompt);
    void sendMessage(pendingPrompt);
  }, [isTyping, location.pathname, sendMessage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const handleNewChatNoEnrol = async (prompt : string) => {
    const trimmed = prompt.trim();
    if (!trimmed || isTyping) return;

    setChatError("");
    setShowMenu(false);

    if (isCreatingChat) return;
    setIsCreatingChat(true);

    try {
      setActiveMessages([]);
      const result = await startChat(prompt);
      const parsedReply = parseAIResponse(result.reply.content);
      const newChat: ChatSession = {
        id: result.session_id,
        backendSessionId: result.session_id,
        title: "New study plan",
        messages: [toFrontendMessage(result.reply)],
        studyPlanData: parsedReply.studyPlanData,
      };

      setChats((existingChats) => [newChat, ...existingChats]);
      setActiveChatId(newChat.id);
      setActiveMessages(newChat.messages);
      setStudyPlanData(newChat.studyPlanData);
      setInputText("");
      setChatError("");

    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "Courseo could not create a new chat."
      );
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleNewChat = async () => {
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
      const result = await startChat(enrollment);
      const parsedReply = parseAIResponse(result.reply.content);
      const newChat: ChatSession = {
        id: result.session_id,
        backendSessionId: result.session_id,
        title: "New study plan",
        messages: [toFrontendMessage(result.reply)],
        studyPlanData: parsedReply.studyPlanData,
      };

      setChats((existingChats) => [newChat, ...existingChats]);
      setActiveChatId(newChat.id);
      setActiveMessages(newChat.messages);
      setStudyPlanData(newChat.studyPlanData);
      setInputText("");
      setChatError("");

    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "Courseo could not create a new chat."
      );
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    const found = chats.find((c) => c.id === id);
    setActiveMessages(found?.messages ?? []);
    setStudyPlanData(found?.studyPlanData ?? null);
    setChatError("");
  };

  const isEmptyChat = activeMessages.length === 0;

  const sidebarChats: Chat[] = chats.map((c) => ({
    id: c.id,
    title: buildChatTitle(c),
  }));


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
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          showHandbook={true}
          onHandbook={() => setShowHandbook(true)}
          onAccount={() => setShowAccount(true)}
          onHelp={() => setShowHelp(true)}
          onSettings={() => navigate("/settings")}
          />
        </div>

        <main className="flex-1 bg-white rounded-[22px] sm:rounded-[26px] xl:rounded-[30px] shadow-[2px_2px_10px_3px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden min-w-0">
          <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 shrink-0">
            <div className="flex items-center gap-1.5">
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
                      { label: "Your Handbook", action: () => { setShowHandbook(true); setShowMenu(false); } },
                      { label: "Settings", action: () => navigate("/settings") },
                      {
                        label: enrollment ? "Update Enrolment" : "Add Enrolment",
                        action: () => navigate("/"),
                      },
                      {
                        label: "Log Out",
                        action: () => {
                          clearAuthSession();
                          clearCourseoStorage();
                          navigate("/");
                        },
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
                  {textBounce("Creating new chat...")}
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
                className="px-4 sm:px-6 pb-3 flex-col gap-2 shrink-0 hidden max-h-48 overflow-auto md:flex w-full max-w-[816px] mx-auto"
              >
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    whileHover={{
                      scale: 1.01,
                      backgroundColor: "rgba(131,231,255,0.65)",
                    }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleNewChatNoEnrol(prompt.replace(/^"|"$/g, ""))}
                    className="bg-[rgba(131,231,255,0.5)] rounded-[15px] px-4 py-2.5 text-left text-[13px] font-extrabold text-[rgba(0,1,129,0.7)] transition-colors"
                  >
                    {prompt}
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
              <div className="flex ml-[75%] px-4 pb-3">
                  <PDFDownloadLink 
                    document={<MyDocument studyPlan={studyPlanData} />} 
                    fileName="myStudyPlan.pdf"
                    className="bg-[rgba(232,160,255,0.5)] rounded-[15px] h-9 flex items-center justify-between px-5 gap-2 overflow-hidden hover:bg-[rgba(232,160,255,0.9)] transition-colors group cursor-pointer"
                  >
                    {({ loading }) => (
                      <div className="flex items-center gap-2">
                        <FileDown size={14} className="text-[#000181] shrink-0" />
                        <span className="text-[11px] font-extrabold text-[#000181] whitespace-nowrap">
                          {loading ? "Preparing PDF..." : "StudyPlan"}
                        </span>
                      </div>
                    )}
                  </PDFDownloadLink>
              </div>

            // code to test the pdf formatting without having to download it every time
            // <div style={{ width: '100%', height: '100vh' }}>
            //   <PDFViewer width="100%" height="100%">
            //     <MyDocument studyPlan={studyPlanData} />
            //   </PDFViewer>
            // </div>
            )}
            
            
            <div className="border border-[rgba(0,50,252,0.65)] rounded-[24px] sm:rounded-[28px] shadow-[0_4px_18px_rgba(0,1,129,0.1)] flex flex-col gap-2 px-4 py-3 w-full max-w-3xl mx-auto">
              <textarea
                ref={inputRef}
                rows={1}
                placeholder="Start typing..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
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
                  onClick={() => sendMessage(inputText)}
                  disabled={!inputText.trim() || isTyping}
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
                onToggle={() => setMobileSidebarOpen(false)}
                expandedWidth="min(86vw, 320px)"
                showHandbook
                onHandbook={() => {
                  setMobileSidebarOpen(false);
                  setShowHandbook(true);
                }}
                onAccount={() => {
                  setMobileSidebarOpen(false);
                  setShowAccount(true);
                }}
                onHelp={() => {
                  setMobileSidebarOpen(false);
                  setShowHelp(true);
                }}
                onSettings={() => navigate("/settings")}
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

      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
