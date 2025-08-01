"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";

import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      id,
      body: { id },
      initialMessages,
      maxSteps: 10,
      onFinish: () => {
        window.history.replaceState({}, "", `/chat/${id}`);
      },
    });

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  // Show initial state if no messages (except system/assistant)
  const hasUserMessages = messages.some(m => m.role === "user" || m.role === "assistant");

  // Scroll to bottom on new message or loading
  useEffect(() => {
    if (messagesEndRef && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isLoading, messagesEndRef]);

  return (
    <div className="flex flex-col items-center justify-center h-dvh w-dvw bg-background">
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .custom-scrollbar:hover, .custom-scrollbar:active, .custom-scrollbar:focus, .custom-scrollbar:scroll {
          scrollbar-color: rgba(255,255,255,0.2) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          background: transparent;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: transparent;
        }
      `}</style>
      {!hasUserMessages ? (
        // Initial state: centered input and logo
        <div className="flex flex-col items-center justify-center size-full">
          {/* Updated Rail logo */}
          <form className="flex flex-row gap-3 items-center size-full max-w-xl px-6">
            <MultimodalInput
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              append={append}
            />
          </form>
        </div>
      ) : (
        // Chat state: messages and input at bottom
        <div className="flex flex-col justify-between items-center gap-6 size-full">
          {/* Italian train route suggestions */}
          <div className="flex flex-row gap-6 mb-6">
            <button
              className="bg-muted px-6 py-4 rounded-xl text-left text-lg text-muted-foreground hover:bg-zinc-800"
              onClick={() => append({
                role: "user",
                content: "Book a train from Rome to Florence",
              })}
            >
              <div className="font-medium">Book a train from Rome to Florence</div>
              <div className="text-xs">from Roma Termini to Firenze SMN</div>
            </button>
            <button
              className="bg-muted px-6 py-4 rounded-xl text-left text-lg text-muted-foreground hover:bg-zinc-800"
              onClick={() => append({
                role: "user",
                content: "What is the status of train ITALO9512 departing tomorrow?",
              })}
            >
              <div className="font-medium">What is the status</div>
              <div className="text-xs">of train ITALO9512 departing tomorrow?</div>
            </button>
          </div>

          <div
            ref={messagesContainerRef}
            className="flex flex-col gap-4 size-full max-w-2xl mx-auto  overflow-y-scroll custom-scrollbar pb-32"
          >
            {messages.map((message) => (
              <PreviewMessage
                key={message.id}
                chatId={id}
                role={message.role}
                content={message.content}
                attachments={message.experimental_attachments}
                toolInvocations={message.toolInvocations}
              />
            ))}
            <div
              ref={messagesEndRef}
              className="shrink-0 min-w-[24px] min-h-[24px]"
            />
          </div>
          <form className="flex flex-row gap-3 fixed bottom-8 left-1/2 -translate-x-1/2 items-end size-full md:max-w-[700px] max-w-[calc(100dvw-32px)] px-6 md:px-0 z-10">
            <MultimodalInput
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              append={append}
            />
          </form>
        </div>
      )}
    </div>
  );
}
