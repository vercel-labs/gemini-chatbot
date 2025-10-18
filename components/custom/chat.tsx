"use client";

import { Attachment, UIMessage } from "ai";
import { useChat } from '@ai-sdk/react';
import { User } from "next-auth";
import { useState } from "react";
import { toast } from "sonner";

import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";

import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";

export function Chat({
  id,
  initialMessages,
  user,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  user: User | undefined;
}) {
  const [input, setInput] = useState('');
  const {
    messages,
    handleSubmit,
    append,
    isLoading,
    stop
  } =
    useChat({
      id,
      body: { id },
      initialMessages,
      maxSteps: 10,
      onFinish: () => {
        if (user) {
          window.history.replaceState({}, "", `/chat/${id}`);
        }
      },
      onError: (error) => {
        if (error.message === "Too many requests") {
          toast.error("Too many requests. Please try again later!");
        }
      },
    });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="flex flex-row justify-center pb-4 md:pb-8 h-dvh bg-background">
      <div className="flex flex-col justify-between items-center gap-4">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-4 h-full w-dvw items-center overflow-y-scroll"
        >
          {messages.length === 0 && <Overview />}

          {messages.map((message) => {
            // Extract text content from parts
            const textContent = message.parts
              ?.filter((part) => part.type === "text")
              .map((part) => part.text)
              .join("");
            
            // Extract file attachments from parts
            const fileAttachments = message.parts
              ?.filter((part) => part.type === "file")
              .map((part) => ({
                url: part.url,
                name: part.name || "",
                contentType: part.mediaType || "",
              })) || [];

            return (
              <PreviewMessage
                key={message.id}
                chatId={id}
                role={message.role}
                content={textContent || ""}
                attachments={fileAttachments}
                toolInvocations={message.toolInvocations}
              />
            );
          })}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        <form className="flex flex-row gap-2 relative items-end w-full md:max-w-[500px] max-w-[calc(100dvw-32px) px-4 md:px-0">
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
    </div>
  );
}
