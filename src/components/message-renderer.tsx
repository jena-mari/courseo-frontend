interface MessageRendererProps {
  content: string;
}

export function MessageRenderer({ content }: MessageRendererProps) {
  // Helper to parse inline HTML 
  const renderFormattedText = (text: string) => {
    // bold to strong tags
    const withBold = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // render converted markup + existing inline HTML
    return <span dangerouslySetInnerHTML={{ __html: withBold }} />;
  };

  // Pre-process content into structural blocks
  const renderContentBlocks = () => {
    const rawLines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < rawLines.length) {
      const line = rawLines[i];
      const trimmed = line.trim();

      // audit details collapsable block
      if (trimmed.startsWith("<details>")) {
        let detailsContent = "";
        let summaryText = "Details";
        i++; 

        while (i < rawLines.length && !rawLines[i].trim().startsWith("</details>")) {
          const currentLine = rawLines[i];
          if (currentLine.trim().startsWith("<summary>")) {
            summaryText = currentLine
              .replace(/<\/?summary>/g, "")
              .replace(/<\/?details>/g, "")
              .trim();
          } else {
            detailsContent += currentLine + "\n";
          }
          i++;
        }
        i++; 

        elements.push(
          <details
            key={`details-${i}`}
            className="my-2 rounded border border-gray-700 bg-white p-2 text-sm text-gray-800"
          >
            <summary className="cursor-pointer font-medium text-[#000181] hover:underline">
              {summaryText}
            </summary>
            <div className="mt-2 pl-2 border-l border-gray-700">
              <MessageRenderer content={detailsContent.trim()} />
            </div>
          </details>
        );
        continue;
      }

      // study plan table
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        const tableLines: string[] = [];
        while (
          i < rawLines.length &&
          rawLines[i].trim().startsWith("|") &&
          rawLines[i].trim().endsWith("|")
        ) {
          tableLines.push(rawLines[i].trim());
          i++;
        }

        const headerLine = tableLines[0];
        const bodyLines = tableLines.slice(1).filter((l) => !l.includes("---"));

        const parseRow = (rowStr: string) =>
          rowStr
            .split("|")
            .slice(1, -1)
            .map((cell) => cell.trim());

        const headers = parseRow(headerLine);

        elements.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-700 text-sm">
              <thead>
                <tr className="bg-[#000181]">
                  {headers.map((h, hIdx) => (
                    <th
                      key={hIdx}
                      className="border border-gray-700 px-3 py-1.5 text-[0.7rem] text-left font-semibold text-white"
                    >
                      {renderFormattedText(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyLines.map((bRow, rIdx) => {
                  const cells = parseRow(bRow);
                  return (
                    <tr key={rIdx} className="bg-white hover:bg-[rgba(131,231,255,0.15)]">
                      {cells.map((cell, cIdx) => (
                        <th
                          key={cIdx}
                          className="border border-gray-700 px-2 py-1.5 text-[0.7rem] font-normal text-left text-gray-700"
                        >
                          {renderFormattedText(cell)}
                        </th>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      // normal text
      if (line === "") {
        elements.push(<div key={`empty-${i}`} className="h-1.5" />);
      } else {
        const isBullet =
          trimmed.startsWith("•") || trimmed.startsWith("-");
        const isNumbered = /^\d+\./.test(trimmed);
        const isQuote = trimmed.startsWith(">");

        if (isQuote) {
          const stripped = line.replace(/^>\s*/, "");
          elements.push(
            <div
              key={`quote-${i}`}
              className="border-l-2 border-[rgba(0,1,129,0.3)] pl-3 text-[rgba(0,1,129,0.7)] italic text-sm"
            >
              {renderFormattedText(stripped)}
            </div>
          );
        } else if (isBullet) {
          const stripped = line.replace(/^[\s•\-]+/, "");
          elements.push(
            <div key={`bullet-${i}`} className="flex gap-2">
              <span className="text-[#000181] mt-0.5 shrink-0">•</span>
              <span>{renderFormattedText(stripped)}</span>
            </div>
          );
        } else if (isNumbered) {
          elements.push(
            <div key={`numbered-${i}`} className="flex gap-2">
              <span className="text-[#000181] shrink-0 font-semibold">
                {line.match(/^\d+\./)?.[0]}
              </span>
              <span>{renderFormattedText(line.replace(/^\d+\.\s*/, ""))}</span>
            </div>
          );
        } else {
          elements.push(
            <p key={`p-${i}`} className="leading-relaxed">
              {renderFormattedText(line)}
            </p>
          );
        }
      }

      i++;
    }

    return elements;
  };

  return <div className="space-y-1">{renderContentBlocks()}</div>;
}
