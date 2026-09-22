/** Decode text only. Callers must render the result as React text, never raw HTML. */
export function decodeMessageText(text: string): string {
  const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  const decode = (value: string) => value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, code: string) => {
    if (!code.startsWith("#")) return named[code.toLowerCase()] ?? entity;
    const point = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : entity;
  });
  // Some replies have been escaped both by the provider and the transport.
  return decode(decode(text)).replace(/\u00a0/g, " ");
}
