import { useState, useRef, useEffect, useCallback, type KeyboardEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, ArrowRight, MoreVertical, Sparkles,
  BookOpen, X, User, Mail, Lock, Eye, EyeOff, HelpCircle
} from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import { CourseoSidebar, type Chat } from "../components/courseo-sidebar";
import { StudyPlan } from "../components/StudyPlan";
import { MessageRenderer } from "../components/message-renderer";
import { generateMockResponse } from "../lib/mockAI";
import { HelpSlider } from "../components/help-carousel";
import { AccountManagement } from "../components/AccountManagementPopup";
import { HandbookModal } from "../components/HandbookModalPopup";

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
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

const INITIAL_CHATS: ChatSession[] = [
  {
    id: "chat-1",
    title: "What are my core subjects for Year 2?",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "What are my core subjects for Year 2?",
        timestamp: new Date(Date.now() - 86400000 * 3),
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Based on your enrolment record, your **core Year 2 subjects** are:\n\n1. **COMP3210 — Algorithms & Data Structures** *(Required)*\n2. **COMP3340 — Software Engineering** *(Required)*\n3. **MATH2050 — Linear Algebra** *(Required)*\n\nYou also need to complete **one elective** to reach full load. Would you like recommendations?",
        timestamp: new Date(Date.now() - 86400000 * 3 + 30000),
      },
    ],
  },
  {
    id: "chat-2",
    title: "Can I get into game development with this degree?",
    messages: [
      {
        id: "m3",
        role: "user",
        content: "Can I get into game development with this degree?",
        timestamp: new Date(Date.now() - 86400000 * 1),
      },
      {
        id: "m4",
        role: "assistant",
        content:
          "Absolutely! Your **Bachelor of Computer Science** is a perfect foundation for game development. Here are the most relevant subjects:\n\n• **COMP3450** — Computer Graphics *(start here!)*\n• **COMP4200** — Game Engine Architecture\n• **COMP3360** — Real-time Rendering\n\nI can build you a full game-dev focused plan — just ask!",
        timestamp: new Date(Date.now() - 86400000 * 1 + 30000),
      },
    ],
  },
  {
    id: "chat-3",
    title: "How do I check my prerequisites?",
    messages: [
      {
        id: "m5",
        role: "user",
        content: "How do I check my prerequisites?",
        timestamp: new Date(Date.now() - 86400000 * 0.5),
      },
    ],
  },
];

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
  const enrollment = localStorage.getItem("courseoEnrollment") ?? "";
  const userRaw = localStorage.getItem("courseoUser");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [chats, setChats] = useState<ChatSession[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>("new");
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [studyPlanCollapsed, setStudyPlanCollapsed] = useState(false);
  const [showHandbook, setShowHandbook] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendingPromptSentRef = useRef(false);

  useEffect(() => {
    if (activeChatId === "new") {
      setActiveMessages([]);
    } else {
      const found = chats.find((c) => c.id === activeChatId);
      setActiveMessages(found?.messages ?? []);
    }
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, isTyping]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

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

      let chatId = activeChatId;
      const chatTitle = buildChatTitle({
        id: chatId,
        title: trimmed,
        messages: [{ ...userMsg }],
      });

      if (activeChatId === "new") {
        chatId = `chat-${Date.now()}`;
        const newSession: ChatSession = {
          id: chatId,
          title: chatTitle,
          messages: newMessages,
        };
        setChats((prev) => [newSession, ...prev]);
        setActiveChatId(chatId);
      } else {
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId ? { ...c, title: buildChatTitle({ ...c, messages: newMessages }), messages: newMessages } : c
          )
        );
      }

      const delay = 1200 + Math.random() * 800;
      await new Promise((r) => setTimeout(r, delay));

      const aiContent = generateMockResponse(trimmed, enrollment);
      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: aiContent,
        timestamp: new Date(),
      };

      const finalMessages = [...newMessages, aiMsg];
      setActiveMessages(finalMessages);
      setIsTyping(false);

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, title: buildChatTitle({ ...c, messages: finalMessages }), messages: finalMessages }
            : c
        )
      );
    },
    [activeMessages, activeChatId, enrollment, isTyping]
  );

  useEffect(() => {
    if (pendingPromptSentRef.current || isTyping) return;
    const pendingPrompt = localStorage.getItem("courseoPendingPrompt");
    if (!pendingPrompt) return;
    pendingPromptSentRef.current = true;
    localStorage.removeItem("courseoPendingPrompt");
    sendMessage(pendingPrompt);
  }, [isTyping, sendMessage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const handleNewChat = () => {
    setActiveChatId("new");
    setActiveMessages([]);
    setInputText("");
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    const found = chats.find((c) => c.id === id);
    setActiveMessages(found?.messages ?? []);
  };

  const isEmptyChat = activeMessages.length === 0;

  const sidebarChats: Chat[] = chats.map((c) => ({
    id: c.id,
    title: buildChatTitle(c),
  }));

  return (
    <div
      className="relative w-full h-screen overflow-hidden font-['Montserrat',sans-serif]"
    >
      <img
        src={imgBg}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        alt=""
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      <div className="relative z-10 flex items-stretch gap-4 p-5 h-screen">
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

        <div className="flex-1 bg-white rounded-[30px] shadow-[2px_2px_10px_3px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden min-w-0">
          <div className="flex items-center justify-between px-7 py-5 shrink-0">
            <p className="font-extrabold text-2xl text-[#000181] tracking-[-0.96px]">
              Courseo
            </p>
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
                      { label: "New Chat", action: handleNewChat },
                      { label: "Your Handbook", action: () => { setShowHandbook(true); setShowMenu(false); } },
                      { label: "Settings", action: () => navigate("/settings") },
                      {
                        label: enrollment ? "Update Enrolment" : "Add Enrolment",
                        action: () => navigate("/"),
                      },
                      { label: "Log Out", action: () => { localStorage.clear(); navigate("/"); } },
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

          {/* <Slider onClose={() => setShowHelp(false)}></Slider> */}

          <div className="flex-1 overflow-y-auto px-7 pb-4 min-h-0">
            {isEmptyChat ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center h-full min-h-[200px]"
              >
                <motion.h1
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="font-extrabold text-[clamp(48px,6vw,88px)] text-[#000181] text-center tracking-[-3px] leading-[0.95] mb-4"
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
            ) : (
              <div className="flex flex-col gap-4 py-4">
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
            {isEmptyChat && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.2 }}
                className="px-7 pb-3 flex-col gap-2 shrink-0 hidden max-h-48 overflow-auto md:flex"
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
                    onClick={() => sendMessage(prompt.replace(/^"|"$/g, ""))}
                    className="bg-[rgba(131,231,255,0.5)] rounded-[15px] px-4 py-2.5 text-left text-[13px] font-extrabold text-[rgba(0,1,129,0.7)] transition-colors"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-7 pb-6 shrink-0">
            <div className="border border-[#0032fc] rounded-[30px] shadow-[2px_2px_10px_3px_rgba(0,1,129,0.1)] flex flex-col gap-2 p-4">
              <textarea
                ref={inputRef}
                rows={1}
                placeholder="Start typing..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 resize-none text-xl font-semibold text-[rgba(0,1,129,0.6)] placeholder:text-[rgba(0,1,129,0.4)] outline-none bg-transparent leading-snug overflow-hidden w-full"
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
        </div>

        <StudyPlan
          collapsed={studyPlanCollapsed}
          onToggle={() => setStudyPlanCollapsed((v) => !v)}
        />
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

      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
