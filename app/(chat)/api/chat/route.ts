import {
  type UIMessage,
  convertToModelMessages,
  streamText,
  smoothStream,
} from "ai";
import { checkBotId } from "botid/server";

import { createChat, deleteChatById, renameChat, updateChat } from "@/db/queries";
import { models, type ModelId } from "@/lib/models";

function latest(messages: UIMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role !== "user") {
      continue;
    }

    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join(" ")
      .trim();
  }

  return "";
}

function image(text: string) {
  return /\b(image|images|picture|pictures|photo|photos|draw|drawing|render|illustration|illustrations|generate|generated|create|make|design|paint|sketch|visualize)\b/i.test(
    text,
  );
}

function select(modelId: ModelId, text: string) {
  if (modelId === "gemini-3-pro" && image(text)) {
    return models["gemini-3-pro-image"];
  }

  return models[modelId] ?? models["gemini-3.1-flash-image"];
}

export const maxDuration = 60;
export const maxBodySize = "50mb";

export async function POST(request: Request) {
  const { isBot } = await checkBotId();

  if (isBot) {
    return new Response("Access denied", { status: 403 });
  }

  let body: { messages: UIMessage[]; chatId?: string; modelId?: ModelId };
  try {
    body = await request.json();
  } catch {
    return new Response("Request too large or malformed", { status: 413 });
  }

  const { messages, chatId, modelId = "gemini-3.1-flash-image" } = body;

  const prompt = latest(messages);
  const selected = select(modelId, prompt);
  const modelMessages = await convertToModelMessages(messages);

  const isImageRequest = image(prompt);
  console.log(`[chat] model=${modelId} image=${isImageRequest} prompt="${prompt.slice(0, 50)}"`);

  if (chatId && messages.length === 1) {
    await createChat({ id: chatId, messages, modelId });
  }

  const result = streamText({
    model: selected.model,
    system: isImageRequest ? selected.imageSystem : selected.textSystem,
    messages: modelMessages,
    providerOptions: isImageRequest ? selected.imageOptions : selected.textOptions,
    includeRawChunks: true,
    experimental_transform: smoothStream({
      delayInMs: 20,
    }),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    sendReasoning: true,
    onFinish: async ({ messages: next }) => {
      if (chatId && next.length > 0) {
        await updateChat({
          id: chatId,
          messages: next,
        });
      }
    },
  });
}

export async function PATCH(request: Request) {
  const { id, title }: { id: string; title: string } = await request.json();

  if (!id || !title) {
    return new Response("Bad request", { status: 400 });
  }

  await renameChat({ id, title: title.trim().slice(0, 200) });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  await deleteChatById({ id });
  return new Response("Chat deleted", { status: 200 });
}
