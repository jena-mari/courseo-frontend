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
  expandedWidth = "clamp(232px, 20vw, 264px)",
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
      className="relative flex h-full shrink-0 flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white/95 shadow-[0_12px_38px_rgba(0,1,129,0.11)] backdrop-blur-xl"
    >
      <div className={`flex shrink-0 items-center pt-4 pb-3 ${
        collapsed ? "justify-center px-2" : "justify-between px-4"
      }`}>
        {!collapsed && (
          <div className="flex min-w-0 items-center gap-2.5">
            <img
              src={imgLogo}
              alt="Courseo"
              className="h-9 w-9 shrink-0 object-contain"
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="whitespace-nowrap text-[20px] font-extrabold tracking-[-0.5px] text-[#000181]"
            >
              Courseo
            </motion.span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#000181] transition-colors hover:bg-gray-100"
          title={collapsed ? "Expand navigation" : "Collapse navigation"}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <div className={`flex shrink-0 flex-col gap-2 ${collapsed ? "items-center px-3" : "px-4"}`}>
        <div className={`flex h-10 items-center overflow-hidden rounded-[13px] border-2 border-[rgba(0,1,129,0.5)] bg-white transition-colors focus-within:border-[#000181] ${collapsed ? "w-10 justify-center px-0" : "w-full gap-2.5 px-3"}`}>
          <Search size={15} className="shrink-0 text-[#000181] opacity-50" />
          {!collapsed && (
            <input
              type="text"
              placeholder="Search Chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-[12px] font-semibold text-[rgba(0,1,129,0.5)] outline-none placeholder:text-[rgba(0,1,129,0.5)]"
            />
          )}
        </div>

        <button
          onClick={onNewChat}
          className={`group flex h-10 items-center overflow-hidden rounded-[13px] bg-[rgba(131,231,255,0.5)] transition-all hover:bg-[rgba(131,231,255,0.7)] ${collapsed ? "w-10 justify-center px-0" : "w-full justify-between gap-2 px-3.5"}`}
        >
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
            <PenLine size={14} className="shrink-0 text-[#000181]" />
            {!collapsed && (
              <span className="whitespace-nowrap text-[12px] font-bold text-[#000181]">
                Create Chat
              </span>
            )}
          </div>
          {!collapsed && <ChevronRight size={15} className="text-[#000181]" />}
        </button>

        {showHandbook && (
          <button
            onClick={onHandbook}
            className={`flex h-10 items-center overflow-hidden rounded-[13px] bg-[rgba(131,231,255,0.5)] transition-all hover:bg-[rgba(131,231,255,0.7)] ${collapsed ? "w-10 justify-center px-0" : "w-full justify-between gap-2 px-3.5"}`}
          >
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
              <BookOpen size={14} className="shrink-0 text-[#000181]" />
              {!collapsed && (
                <span className="whitespace-nowrap text-[12px] font-bold text-[#000181]">
                  Your Handbook
                </span>
              )}
            </div>
            {!collapsed && <ChevronRight size={15} className="text-[#000181]" />}
          </button>
        )}
      </div>

      <div className={`${collapsed ? "mx-3" : "mx-4"} my-3 border-t border-[#000181]`} />

      <div className={`min-h-0 flex-1 overflow-y-auto ${collapsed ? "px-3" : "px-4"}`}>
        {!collapsed && (
          <p className="mb-2 px-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#000181]">
            Previous Chats
          </p>
        )}
        <div className="flex flex-col gap-1">
          {filteredChats.map((chat, index) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`
                group/chat flex min-h-8 w-full items-center font-semibold text-[#000181]
                transition-colors overflow-hidden
                ${activeChatId === chat.id
                  ? `bg-[rgba(232,160,255,0.5)] ${collapsed ? "rounded-[12px]" : "rounded-[10px]"}`
                  : `${collapsed ? "rounded-[12px]" : "rounded-[10px]"} hover:bg-[rgba(131,231,255,0.3)]`
                }
              `}
              title={chat.title}
            >
              <button
                type="button"
                onClick={() => onSelectChat(chat.id)}
                className={`min-w-0 flex-1 overflow-hidden text-left !text-[11px] whitespace-nowrap ${collapsed ? "flex h-10 items-center justify-center px-0 !leading-10" : "h-8 px-2.5 !leading-8 text-ellipsis"}`}
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
                  className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[rgba(0,1,129,0.42)] opacity-0 transition-all hover:bg-white/70 hover:text-red-600 focus:opacity-100 group-hover/chat:opacity-100"
                  aria-label={`Delete chat: ${chat.title}`}
                  title="Delete chat"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className={`${collapsed ? "mx-3" : "mx-4"} my-3 border-t border-[#000181]`} />

      <div className={`${collapsed ? "px-3" : "px-4"} pb-4 shrink-0`}>
        {!collapsed && (
          <p className="mb-2 px-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#000181]">
            Settings &amp; Help
          </p>
        )}
        <div className="flex flex-col gap-1">
          <button
            onClick={onAccount}
            className={`flex items-center rounded-[11px] text-[12px] font-semibold text-[#000181] transition-colors ${collapsed ? "h-10 w-10 justify-center px-0" : "h-9 gap-2.5 px-2.5"} ${
              activeUtility === "account"
                ? "bg-[rgba(232,160,255,0.5)]"
                : "hover:bg-[rgba(131,231,255,0.2)]"
            }`}
          >
            <User size={15} className="shrink-0" />
            {!collapsed && <span>Account</span>}
          </button>
          
          <button
            onClick={onSettings}
            className={`flex items-center rounded-[11px] text-[12px] font-semibold text-[#000181] transition-colors ${collapsed ? "h-10 w-10 justify-center px-0" : "h-9 gap-2.5 px-2.5"} ${
              activeUtility === "settings"
                ? "bg-[rgba(232,160,255,0.5)]"
                : "hover:bg-[rgba(131,231,255,0.2)]"
            }`}
          >
            <Settings size={15} className="shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>

          <button
            onClick={onHelp}
            className={`flex items-center rounded-[11px] text-[12px] font-semibold text-[#000181] transition-colors ${collapsed ? "h-10 w-10 justify-center px-0" : "h-9 gap-2.5 px-2.5"} ${
              activeUtility === "help"
                ? "bg-[rgba(232,160,255,0.5)]"
              : "hover:bg-[rgba(131,231,255,0.2)]"
            }`}
          >
            <HelpCircle size={15} className="shrink-0" />
            {!collapsed && <span>Help</span>}
          </button>
        </div>
      </div>

    </motion.div>
  );
}
