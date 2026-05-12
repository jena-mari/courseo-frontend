import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, ArrowRight, MoreVertical, Sparkles,
  BookOpen, X
} from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import { CourseoSidebar, type Chat } from "../components/courseo-sidebar";
import { MessageRenderer } from "../components/message-renderer";
import { generateMockResponse } from "../lib/mockAI";

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

// Handbook modal component
function HandbookModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="bg-white rounded-[40px] shadow-xl w-full max-w-xl p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#000181] transition-colors"
        >
          <X size={18} strokeWidth={3} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[rgba(131,231,255,0.5)] rounded-xl flex items-center justify-center">
            <BookOpen size={20} className="text-[#000181]" />
          </div>
          <h2 className="font-extrabold text-2xl text-[#000181] tracking-tight">
            Your Handbook
          </h2>
        </div>

        <div className="space-y-4 text-[14px] text-[#000181]">
          <div className="bg-[rgba(131,231,255,0.2)] rounded-2xl p-4">
            <p className="font-bold mb-1">📋 Degree: Bachelor of Computer Science</p>
            <p className="font-semibold opacity-70">Year 2 · 40 Credit Points completed</p>
          </div>
          <div>
            <p className="font-black mb-2 text-[15px]">Key Policies</p>
            <ul className="space-y-1.5 font-semibold opacity-80">
              <li>• Standard load: 4 subjects (20 CP) per semester</li>
              <li>• Maximum load: 5 subjects with approval (GPA ≥ 5.0)</li>
              <li>• Late penalty: 5% per day</li>
              <li>• Minimum pass mark: 50% per subject</li>
              <li>• Total required: 240 CP to graduate</li>
            </ul>
          </div>
          <div>
            <p className="font-black mb-2 text-[15px]">Important Dates</p>
            <ul className="space-y-1.5 font-semibold opacity-80">
              <li>• Enrolment opens: 28 Feb 2026</li>
              <li>• Autumn session starts: 2 Mar 2026</li>
              <li>• Census date: 31 Mar 2026</li>
              <li>• Final exams: 20 Jun – 4 Jul 2026</li>
            </ul>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="mt-5 w-full bg-[rgba(131,231,255,0.5)] border-2 border-[#000181] rounded-[20px] h-11 font-bold text-[14px] text-[#000181]"
        >
          Got it
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// Typing indicator
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

// Single message bubble
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
  const [showHandbook, setShowHandbook] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChatId === "new") {
      setActiveMessages([]);
    } else {
      const found = chats.find((c) => c.id === activeChatId);
      setActiveMessages(found?.messages ?? []);
    }
  }, [activeChatId]);

  // Scroll to bottom when messages change
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

      // Capture the chatId in closure scope so async callback can reference it
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

      // Simulate AI thinking time
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

      // Update chat session with AI response
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
      {/* Background */}
      <img
        src={imgBg}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        alt=""
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* Main Layout */}
      <div className="relative z-10 flex items-stretch gap-4 p-5 h-screen">
        {/* Sidebar */}
        <CourseoSidebar
          chats={sidebarChats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          showHandbook={true}
          onHandbook={() => setShowHandbook(true)}
        />

        {/* Main Chat Area */}
        <div className="flex-1 bg-white rounded-[30px] shadow-[2px_2px_10px_3px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden min-w-0">
          {/* Top bar */}
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
                      { label: "Settings", action: () => setShowMenu(false) },
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

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-7 pb-4 min-h-0">
            {isEmptyChat ? (
              // Empty state
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center h-full min-h-[300px]"
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
              // Chat messages
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

          {/* Suggested prompts (only shown when empty) */}
          <AnimatePresence>
            {isEmptyChat && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.2 }}
                className="px-7 pb-3 flex flex-col gap-2 shrink-0"
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

          {/* Input area */}
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
                  onClick={() => {
                    // Attach file (mock)
                  }}
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
      </div>

      {/* Handbook Modal */}
      <AnimatePresence>
        {showHandbook && (
          <HandbookModal onClose={() => setShowHandbook(false)} />
        )}
      </AnimatePresence>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}