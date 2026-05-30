import { generateId } from "ai";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ModelMessage, UIMessage } from "ai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function convertToUIMessages(
  messages: Array<ModelMessage | UIMessage>,
): UIMessage[] {
  if (
    messages.every(
      (message) =>
        typeof message === "object" &&
        message !== null &&
        "parts" in message &&
        Array.isArray(message.parts),
    )
  ) {
    return messages as UIMessage[];
  }

  const result: UIMessage[] = [];

  for (const message of messages as ModelMessage[]) {
    if (message.role === "tool") continue;

    const parts: UIMessage["parts"] = [];

    if (typeof message.content === "string") {
      if (message.content.length > 0) {
        parts.push({ type: "text", text: message.content });
      }
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === "text") {
          parts.push({ type: "text", text: content.text });
        }
      }
    }

    if (parts.length > 0) {
      result.push({
        id: generateId(),
        role: message.role as UIMessage["role"],
        parts,
      });
    }
  }

  return result;
}
