import { redirect } from "next/navigation";

import { Chat as PreviewChat } from "@/components/custom/chat";
import { getChatById } from "@/db/queries";
import { convertToUIMessages } from "@/lib/utils";

import type { Chat } from "@/db/schema";
import type { ModelId } from "@/lib/models";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chatFromDb = await getChatById({ id });

  if (!chatFromDb) {
    redirect("/");
  }

  const chat: Chat = {
    ...chatFromDb,
    messages: convertToUIMessages(chatFromDb.messages as Chat["messages"]),
  };

  return (
    <PreviewChat
      id={chat.id}
      initialMessages={chat.messages}
      initialModelId={(chat.modelId as ModelId) ?? undefined}
    />
  );
}
