import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, PanelLeftOpen, PanelRightOpen } from "lucide-react";
import type { ChatController } from "../../features/chat/useChat";

type Props = Pick<ChatController, "navigate" | "setMobileSidebarOpen" | "availableModels" | "selectedModel" | "changeModel" | "setMobileStudyPlanOpen" | "setShowMenu" | "showMenu" | "isCreatingChat" | "handleNewChat" | "handbookHref" | "enrollment" | "handleLogout" | "isLoggingOut">;

export function ChatHeader({ navigate, setMobileSidebarOpen, availableModels, selectedModel, changeModel, setMobileStudyPlanOpen, setShowMenu, showMenu, isCreatingChat, handleNewChat, handbookHref, enrollment, handleLogout, isLoggingOut }: Props) {
  return (
          <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 shrink-0">
            <div className="flex min-w-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-[#000181] hover:bg-gray-100 transition-colors"
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

  );
}
