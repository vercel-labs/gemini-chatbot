import { useEffect, useRef, RefObject, useCallback } from "react";

/**
 * Custom hook to automatically scroll to bottom when content changes
 * Uses MutationObserver for efficient DOM change detection
 * @returns Tuple of container ref and end ref
 */
export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  
  const scrollToBottom = useCallback(() => {
    const end = endRef.current;
    if (end) {
      end.scrollIntoView({ behavior: "instant", block: "end" });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      // Throttle the scroll function to improve performance
      let timeoutId: NodeJS.Timeout;
      
      const observer = new MutationObserver(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(scrollToBottom, 16); // ~60fps
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        // Remove attributes and characterData for better performance
        // as they're not needed for chat message updates
      });

      return () => {
        observer.disconnect();
        clearTimeout(timeoutId);
      };
    }
  }, [scrollToBottom]);

  return [containerRef, endRef];
}
