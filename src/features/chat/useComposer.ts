import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export function useComposer(inputText: string) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resizeComposer = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
    input.style.overflowY = input.scrollHeight > input.clientHeight ? "auto" : "hidden";
  }, []);

  // Covers typing, pasted text, prompt buttons, clearing after send and retries.
  useLayoutEffect(resizeComposer, [inputText, resizeComposer]);
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    let width = input.getBoundingClientRect().width;
    const observer = new ResizeObserver(() => {
      const nextWidth = input.getBoundingClientRect().width;
      if (nextWidth !== width) {
        width = nextWidth;
        resizeComposer();
      }
    });
    observer.observe(input);
    window.addEventListener("resize", resizeComposer);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resizeComposer);
    };
  }, [resizeComposer]);
  return inputRef;
}
