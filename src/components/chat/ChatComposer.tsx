import { motion } from "framer-motion";
import { Plus, ArrowRight } from "lucide-react";
import { ChatProgress } from "./ChatProgress";
import type { ChatController } from "../../features/chat/useChat";
import { lazy, Suspense } from "react";
import { LoadingIndicator } from "../ui/LoadingIndicator";
const StudyPlanDownload = lazy(() => import("../study-plan/StudyPlanDownload"));

type Props = Pick<ChatController, "keyStatus" | "chatError" | "studyPlanData" | "inputRef" | "inputText" | "setInputText" | "handleKeyDown" | "submitComposer" | "isTyping">;

export function ChatComposer({ keyStatus, chatError, studyPlanData, inputRef, inputText, setInputText, handleKeyDown, submitComposer, isTyping }: Props) {
  return (
          <div className="px-3 sm:px-6 pb-3 sm:pb-5 shrink-0">
            {keyStatus === "checking" && <div className="mx-auto max-w-3xl"><ChatProgress phase="checking" /></div>}
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
                <Suspense fallback={<span role="status" className="flex items-center gap-2 h-9 rounded-[15px] bg-[#f1e8ff] px-5 text-[11px] font-extrabold leading-9 text-[#000181]"><LoadingIndicator size={14} />Preparing download…</span>}>
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
                className="flex-none resize-none text-[16px] font-semibold text-[rgba(0,1,129,0.72)] placeholder:text-[rgba(0,1,129,0.4)] outline-none bg-transparent leading-snug overflow-y-auto w-full"
                aria-label="Message Courseo"
                style={{ minHeight: "1.6em", maxHeight: "min(240px, 30dvh)" }}
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
  );
}
