"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function Lightbox({
  src,
  onClose,
}: {
  src: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!src) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [src, onClose]);

  const download = useCallback(() => {
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = `image-${Date.now()}.png`;
    a.click();
    toast.success("Downloading");
  }, [src]);

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.img
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
            src={src}
            alt="full size"
            className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute top-4 right-4 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                download();
              }}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Download"
            >
              <svg className="size-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M8 2v9m0 0l-3-3m3 3l3-3M3 13h10" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <svg className="size-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
