import "server-only";

import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { generateText, gateway } from "ai";
import type { UIMessage } from "ai";

import { chat, user } from "./schema";

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
const db = drizzle(client);

const ANON_USER_ID = "00000000-0000-0000-0000-000000000000";

async function ensureAnonUser() {
  const existing = await db
    .select()
    .from(user)
    .where(eq(user.id, ANON_USER_ID));
  if (existing.length === 0) {
    await db.insert(user).values({
      id: ANON_USER_ID,
      email: "anon@local",
      password: null,
    });
  }
}

let anonReady: Promise<void> | null = null;
function getAnonReady() {
  if (!anonReady) anonReady = ensureAnonUser();
  return anonReady;
}

function extractFirstUserText(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "";

  for (const part of first.parts) {
    if (part.type === "text") {
      return part.text;
    }
  }

  return "";
}

async function generateTitle(userText: string): Promise<string> {
  const fallback = userText.slice(0, 80) || "New chat";
  if (!userText) return fallback;

  try {
    const { text } = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      system:
        "Generate a short clean title (3-5 words, title case) summarizing this message. No quotes, no markdown, no asterisks, no special characters, no screenplay format. Just plain words like: Samurai Sunset Cliff Blossoms",
      prompt: userText.slice(0, 500),
      providerOptions: { gateway: { order: ["google", "vertex"] } },
    });

    const cleaned = text
      .trim()
      .replace(/^["'*#]+|["'*#]+$/g, "")
      .replace(/\*+/g, "")
      .replace(/^(INT|EXT)[\s.]+/i, "")
      .replace(/\s*[-–—]\s*.*/g, "")
      .trim()
      .slice(0, 100);

    return cleaned || fallback;
  } catch {
    return fallback;
  }
}

export async function createChat({
  id,
  messages,
  modelId,
}: {
  id: string;
  messages: UIMessage[];
  modelId?: string;
}) {
  await getAnonReady();
  try {
    const existing = await db.select().from(chat).where(eq(chat.id, id));
    if (existing.length > 0) return;

    const userText = extractFirstUserText(messages);

    await db.insert(chat).values({
      id,
      createdAt: new Date(),
      title: userText.slice(0, 80) || "New chat",
      modelId: modelId ?? null,
      messages: JSON.stringify(messages),
      userId: ANON_USER_ID,
    });

    generateTitle(userText).then(async (title) => {
      await db
        .update(chat)
        .set({ title })
        .where(eq(chat.id, id))
        .catch(() => {});
    });
  } catch (error) {
    console.error("Failed to create chat:", error);
  }
}

export async function updateChat({
  id,
  messages,
}: {
  id: string;
  messages: UIMessage[];
}) {
  try {
    await db
      .update(chat)
      .set({ messages: JSON.stringify(messages) })
      .where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to update chat:", error);
  }
}

export async function renameChat({ id, title }: { id: string; title: string }) {
  try {
    await db.update(chat).set({ title }).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to rename chat:", error);
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat:", error);
  }
}

export async function getAllChats() {
  try {
    return await db.select().from(chat).orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats:", error);
    return [];
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selected] = await db
      .select()
      .from(chat)
      .where(eq(chat.id, id));
    return selected;
  } catch (error) {
    console.error("Failed to get chat:", error);
    return null;
  }
}
