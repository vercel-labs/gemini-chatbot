import {
  ModelMessage,
  CoreToolMessage,
  generateId,
  UIMessage,
  UIToolInvocation,
} from "ai";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { Chat } from "@/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the data.",
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

export function getLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(key) || "[]");
  }
  return [];
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Note: This utility function will be replaced by proper conversion functions in Phase 5
// For now, it provides basic compatibility for converting stored messages
export function convertToUIMessages(
  messages: Array<ModelMessage>,
): Array<any> {
  return messages.map((message) => {
    if (message.role === "tool") {
      // Skip tool messages for now - will be handled by conversion functions
      return null;
    }

    const parts: any[] = [];

    if (typeof message.content === "string") {
      parts.push({ type: "text", text: message.content });
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === "text") {
          parts.push({ type: "text", text: content.text });
        } else if (content.type === "tool-call") {
          parts.push({
            type: `tool-${content.toolName}`,
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            input: (content as any).args,
            state: "input-available",
          });
        }
      }
    }

    return {
      id: generateId(),
      role: message.role,
      parts,
    };
  }).filter(Boolean);
}

export function getTitleFromChat(chat: Chat) {
  const messages = chat.messages;
  const firstMessage = messages[0];

  if (!firstMessage || !firstMessage.parts) {
    return "Untitled";
  }

  // Extract text from parts array (v5 format)
  const textParts = firstMessage.parts
    .filter((part: any) => part.type === "text")
    .map((part: any) => part.text)
    .join("");
  
  return textParts || "Untitled";
}
