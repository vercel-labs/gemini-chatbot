"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  Message as PreviewMessage,
  ReasoningIndicator,
  ErrorMessage,
} from "./message";
import { Lightbox } from "./lightbox";
import { useScrollToBottom } from "./use-scroll-to-bottom";
import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";

import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import type { ModelId } from "@/lib/models";

export function Chat({
  id,
  initialMessages,
  initialModelId,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  initialModelId?: ModelId;
}) {
  const [modelId, setModelId] = useState<ModelId>(
    initialModelId ?? "gemini-3.1-flash-image",
  );
  const modelIdRef = useRef(modelId);
  modelIdRef.current = modelId;
  const router = useRouter();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ chatId: id, modelId: modelIdRef.current }),
      }),
    [],
  );

  const { messages, sendMessage, setMessages, status, stop, error } = useChat({
    id,
    messages: initialMessages,
    transport,
    onFinish: () => {
      window.history.replaceState({}, "", `/chat/${id}`);
      mutate("/api/history");
    },
  });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [input, setInput] = useState("");
  const hasSentRef = useRef(false);
  useEffect(() => {
    inputRef.current?.focus();
  }, [id]);


  const send = useCallback(
    (options: { text: string }) => {
      sendMessage(options);
      if (!hasSentRef.current) {
        hasSentRef.current = true;
        window.history.replaceState({}, "", `/chat/${id}`);
        setTimeout(() => mutate("/api/history"), 500);
      }
    },
    [sendMessage, id],
  );

  const handleClear = useCallback(() => {
    setMessages([]);
    toast.success("Conversation cleared");
  }, [setMessages]);

  const handleDelete = useCallback(async () => {
    try {
      await fetch(`/api/chat?id=${id}`, { method: "DELETE" });
      mutate("/api/history");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to delete chat");
    }
  }, [id, router]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key === "n") {
        e.preventDefault();
        router.push("/");
        router.refresh();
      }

      if (meta && e.key === "k") {
        e.preventDefault();
        setInput("/");
        inputRef.current?.focus();
      }

      if (meta && e.shiftKey && e.key === "Backspace") {
        e.preventDefault();
        handleDelete();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router, setInput, handleDelete]);

  const lastMessage = messages[messages.length - 1];
  const hasEmptyResponse =
    status === "ready" &&
    lastMessage?.role === "assistant" &&
    !lastMessage.parts.some(
      (p) =>
        (p.type === "text" && p.text.trim()) ||
        (p.type === "file" && p.mediaType?.startsWith("image/")) ||
        (p.type === "reasoning-file" && p.mediaType?.startsWith("image/")) ||
        (p.type === "file" &&
          ((p.providerMetadata?.google as { thought?: boolean } | undefined)
            ?.thought === true ||
            (p.providerMetadata?.vertex as { thought?: boolean } | undefined)
              ?.thought === true)),
    );

  return (
    <div className="flex flex-col h-dvh bg-background">
      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-4 pb-4 pt-20">
          {messages.length === 0 && <Overview />}

          {messages.map((message) => (
            <PreviewMessage
              key={message.id}
              role={message.role}
              parts={message.parts}
              onImageClick={setLightboxSrc}
            />
          ))}

          {status === "submitted" && <ReasoningIndicator />}

          {(error || hasEmptyResponse) && (
            <ErrorMessage
              message={
                error?.message?.includes("503")
                  ? "I'm temporarily unavailable right now. Please try again in a moment or switch to a different model."
                  : error?.message?.includes("403")
                    ? "I wasn't able to complete this request. Try rephrasing your prompt and I'll give it another go."
                    : hasEmptyResponse
                      ? "I wasn't able to generate a response for this request. This usually happens with certain content that I can't produce. Try a different prompt and I'll do my best."
                      : "Something went wrong on my end. Please try again."
              }
            />
          )}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>
      </div>

      <div className="flex justify-center px-4 pb-4 md:pb-6">
        <div className="w-full md:max-w-[700px]">
          <MultimodalInput
            ref={inputRef}
            input={input}
            setInput={setInput}
            sendMessage={send}
            status={status}
            stop={stop}
            messages={messages}
            modelId={modelId}
            setModelId={setModelId}
            onClear={handleClear}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
