interface MessageRendererProps {
  content: string;
}

export function MessageRenderer({ content }: MessageRendererProps) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line === "") return <div key={i} className="h-1.5" />;

        // Handle bullet lines
        const isBullet = line.trimStart().startsWith("•") || line.trimStart().startsWith("-");
        const isNumbered = /^\d+\./.test(line.trimStart());
        const isQuote = line.trimStart().startsWith(">");

        const renderBold = (text: string) => {
          const parts = text.split(/\*\*(.*?)\*\*/g);
          return parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-bold">
                {part}
              </strong>
            ) : (
              <span key={j}>{part}</span>
            )
          );
        };

        if (isQuote) {
          const stripped = line.replace(/^>\s*/, "");
          return (
            <div key={i} className="border-l-2 border-[rgba(0,1,129,0.3)] pl-3 text-[rgba(0,1,129,0.7)] italic text-sm">
              {renderBold(stripped)}
            </div>
          );
        }

        if (isBullet) {
          const stripped = line.replace(/^[\s•\-]+/, "");
          return (
            <div key={i} className="flex gap-2">
              <span className="text-[#000181] mt-0.5 shrink-0">•</span>
              <span>{renderBold(stripped)}</span>
            </div>
          );
        }

        if (isNumbered) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-[#000181] shrink-0 font-semibold">{line.match(/^\d+\./)?.[0]}</span>
              <span>{renderBold(line.replace(/^\d+\.\s*/, ""))}</span>
            </div>
          );
        }

        return (
          <p key={i} className="leading-relaxed">
            {renderBold(line)}
          </p>
        );
      })}
    </div>
  );
}
