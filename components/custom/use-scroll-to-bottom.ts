import { useEffect, useRef, useCallback, RefObject } from "react";

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T | null>,
  RefObject<T | null>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  const userScrolledUp = useRef(false);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const threshold = 80;
    const atBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold;

    userScrolledUp.current = !atBottom;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (!container || !end) return;

    const observer = new MutationObserver(() => {
      if (!userScrolledUp.current) {
        end.scrollIntoView({ behavior: "instant", block: "end" });
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return [containerRef, endRef];
}
