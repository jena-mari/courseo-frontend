import { useState } from "react";
import { Search, PenLine, BookOpen, ChevronRight, Settings, HelpCircle, User, PanelLeftClose, PanelLeftOpen, MessageSquare, Trash2 } from "lucide-react";
import imgLogo from "../assets/courseo-logo.png";
import { motion } from "framer-motion";

export interface Chat {
  id: string;
  title: string;
}

interface CourseoSidebarProps {
  chats: Chat[];
  activeChatId?: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat?: (id: string) => void;
  collapsed?: boolean;
  onToggle?: () => void;
  showHandbook?: boolean;
  onHandbook?: () => void;
  activeUtility?: "account" | "settings" | "help";
  onAccount?: () => void;
  onSettings?: () => void;
  onHelp?: () => void;
  expandedWidth?: number | string;
}

export function CourseoSidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  collapsed = false,
  onToggle,
  showHandbook = true,
  onHandbook,
  activeUtility,
  onAccount,
  onSettings,
  onHelp,
  expandedWidth = "clamp(216px, 19vw, 244px)",
}: CourseoSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 64 : expandedWidth }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative bg-white rounded-[30px] shadow-[2px_2px_10px_3px_rgba(0,0,0,0.1)] h-full flex flex-col overflow-hidden shrink-0"
    >
      <div className={`flex items-center pt-5 pb-3 shrink-0 ${
        collapsed ? "justify-center px-2" : "justify-between px-5"
      }`}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={imgLogo}
              alt="Courseo"
              className="w-10 h-10 object-contain shrink-0"
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-extrabold text-xl text-[#000181] tracking-tight whitespace-nowrap"
            >
              Courseo
            </motion.span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-[#000181] shrink-0"
          title={collapsed ? "Expand navigation" : "Collapse navigation"}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <div className="px-4 flex flex-col gap-2 shrink-0">
        <div className="border-2 border-[rgba(0,1,129,0.5)] rounded-[15px] h-9 flex items-center px-3 gap-2 overflow-hidden">
          <Search size={11} className="text-[#000181] opacity-50 shrink-0" />
          {!collapsed && (
            <input
              type="text"
              placeholder="Search Chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[11px] font-extrabold text-[rgba(0,1,129,0.5)] placeholder:text-[rgba(0,1,129,0.5)] outline-none w-full"
            />
          )}
        </div>

        <button
          onClick={onNewChat}
          className="bg-[rgba(131,231,255,0.5)] rounded-[15px] h-9 flex items-center justify-between px-3 gap-2 overflow-hidden hover:bg-[rgba(131,231,255,0.7)] transition-colors group"
        >
          <div className="flex items-center gap-2">
            <PenLine size={11} className="text-[#000181] shrink-0" />
            {!collapsed && (
              <span className="text-[11px] font-extrabold text-[#000181] whitespace-nowrap">
                Create Chat
              </span>
            )}
          </div>
          {!collapsed && <ChevronRight size={13} className="text-[#000181]" />}
        </button>

        {showHandbook && (
          <button
            onClick={onHandbook}
            className="bg-[rgba(131,231,255,0.5)] rounded-[15px] h-9 flex items-center justify-between px-3 gap-2 overflow-hidden hover:bg-[rgba(131,231,255,0.7)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen size={11} className="text-[#000181] shrink-0" />
              {!collapsed && (
                <span className="text-[11px] font-extrabold text-[#000181] whitespace-nowrap">
                  Your Handbook
                </span>
              )}
            </div>
            {!collapsed && <ChevronRight size={13} className="text-[#000181]" />}
          </button>
        )}
      </div>

      <div className="mx-4 border-t border-[#000181] my-3" />

      <div className="max-h-[38%] shrink-0 overflow-y-auto px-4">
        {!collapsed && (
          <p className="text-[11px] font-black text-[#000181] mb-2 tracking-tight">
            Previous Chats
          </p>
        )}
        <div className="flex flex-col gap-0.5">
          {filteredChats.map((chat, index) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`
                group/chat flex h-7 max-h-7 w-full items-center rounded-[10px] text-[9px] font-semibold text-[#000181]
                transition-colors overflow-hidden
                ${activeChatId === chat.id
                  ? "bg-[rgba(232,160,255,0.5)]"
                  : "hover:bg-[rgba(131,231,255,0.3)]"
                }
              `}
              title={chat.title}
            >
              <button
                type="button"
                onClick={() => onSelectChat(chat.id)}
                className={`h-7 min-w-0 flex-1 overflow-hidden px-2.5 text-left leading-7 whitespace-nowrap ${collapsed ? "flex items-center justify-center" : "text-ellipsis"}`}
                aria-label={`Open chat: ${chat.title}`}
              >
                {collapsed ? <MessageSquare size={16} className="text-[#000181]" /> : chat.title}
              </button>
              {!collapsed && onDeleteChat && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="mr-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[rgba(0,1,129,0.42)] opacity-0 transition-all hover:bg-white/70 hover:text-red-600 focus:opacity-100 group-hover/chat:opacity-100"
                  aria-label={`Delete chat: ${chat.title}`}
                  title="Delete chat"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="min-h-3 flex-1" />

      <div className="mx-4 border-t border-[#000181] my-3" />

      <div className="px-4 pb-4 shrink-0">
        {!collapsed && (
          <p className="text-[11px] font-black text-[#000181] mb-2 tracking-tight">
            Settings &amp; Help
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={onAccount}
            className={`flex items-center gap-2 text-[10px] font-semibold text-[#000181] rounded-lg px-2 py-1 transition-colors ${
              activeUtility === "account"
                ? "bg-[rgba(232,160,255,0.5)]"
                : "hover:bg-[rgba(131,231,255,0.2)]"
            }`}
          >
            <User size={11} className="shrink-0" />
            {!collapsed && <span>Account</span>}
          </button>
          
          <button
            onClick={onSettings}
            className={`flex items-center gap-2 text-[10px] font-semibold text-[#000181] rounded-lg px-2 py-1 transition-colors ${
              activeUtility === "settings"
                ? "bg-[rgba(232,160,255,0.5)]"
                : "hover:bg-[rgba(131,231,255,0.2)]"
            }`}
          >
            <Settings size={11} className="shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>

          <button
            onClick={onHelp}
            className={`flex items-center gap-2 text-[10px] font-semibold text-[#000181] rounded-lg px-2 py-1 transition-colors ${
              activeUtility === "help"
                ? "bg-[rgba(232,160,255,0.5)]"
              : "hover:bg-[rgba(131,231,255,0.2)]"
            }`}
          >
            <HelpCircle size={11} className="shrink-0" />
            {!collapsed && <span>Help</span>}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="pb-5 text-center shrink-0">
          <p className="font-extrabold text-2xl text-[#000181] tracking-[-0.96px]">
            Courseo
          </p>
        </div>
      )}
    </motion.div>
  );
}
