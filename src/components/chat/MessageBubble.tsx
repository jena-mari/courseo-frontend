import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { MessageRenderer } from "./message-renderer";
import type { Message } from "../../features/chat/types";

export function MessageBubble({ message, index }: { message: Message; index: number }) {
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
        className={`min-w-0 max-w-[90%] [overflow-wrap:anywhere] sm:max-w-[85%] rounded-[20px] px-5 py-3 text-[14px] font-['Montserrat',sans-serif] ${
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

