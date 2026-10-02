import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";
import { ChatProgress } from "./ChatProgress";
import type { ChatController } from "../../features/chat/useChat";
import { MessageBubble } from "./MessageBubble";
import { SUGGESTED_PROMPTS } from "../../features/chat/constants";

type Props = Pick<ChatController, "isEmptyChat" | "isCreatingChat" | "chatPhase" | "enrollment" | "activeMessages" | "isTyping" | "messagesEndRef" | "setShowHelp" | "fillComposer">;

export function ChatConversation({ isEmptyChat, isCreatingChat, chatPhase, enrollment, activeMessages, isTyping, messagesEndRef, setShowHelp, fillComposer }: Props) {
  return (
          <div className={`courseo-scroll min-h-0 min-w-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-6 ${isEmptyChat ? "flex flex-col" : ""}`} role="region" aria-label="Conversation" tabIndex={0}>
            {isEmptyChat ? (
              <>
              {isCreatingChat ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="courseo-chat-welcome flex w-full flex-col items-center justify-center max-w-3xl mx-auto"
                >
                  <ChatProgress phase={chatPhase} />
                </motion.div>

              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="courseo-chat-welcome flex w-full flex-col items-center justify-center max-w-3xl mx-auto"
                >
                  <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="font-extrabold text-[clamp(38px,6vw,68px)] text-[#000181] text-center tracking-[-2.5px] leading-[0.98] mb-4"
                  >
                    Let’s plan your studies
                  </motion.h1>
                  {!enrollment && <p className="max-w-md text-center text-[13px] font-semibold leading-relaxed text-[rgba(0,1,129,0.6)]">Paste your enrolment record from SOLS, or ask a question about your studies.</p>}
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
                      <ChatProgress phase={chatPhase} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}

            <AnimatePresence>
              {isEmptyChat && !isCreatingChat && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.2 }}
                  className="mx-auto flex w-full max-w-3xl flex-col gap-2 pb-3"
                >
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[rgba(0,1,129,0.12)] bg-white/80 px-3 py-2.5">
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

          </div>

  );
}
