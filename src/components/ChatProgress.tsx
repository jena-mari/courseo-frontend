import { LoadingIndicator } from "./LoadingIndicator";
import { useEffect, useState } from "react";
import { CHAT_PHASES, type ChatPhase } from "../lib/chatProgress";

export function ChatProgress({ phase }: { phase: ChatPhase }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const status = CHAT_PHASES[phase];
  return (
    <div className="courseo-loading-enter my-3 flex max-w-xl items-start gap-3 rounded-[18px] border border-[rgba(0,1,129,0.12)] bg-[#f7f8ff] px-4 py-3 text-[#000181]" data-chat-progress={phase}>
      <LoadingIndicator size={18} className="mt-0.5 shrink-0 " aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div key={phase} className="courseo-loading-enter" role="status" aria-live="polite" aria-atomic="true">
          <p className="text-[13px] font-extrabold">{status.title}</p>
          <p className="mt-1 text-[12px] font-medium leading-relaxed text-[#000181]/65">{status.detail}</p>
        </div>
        <p className="mt-2 text-[11px] text-[#000181]/55">{seconds}s elapsed</p>
      </div>
    </div>
  );
}
