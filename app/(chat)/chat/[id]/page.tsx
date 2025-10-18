import { notFound } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { Chat as PreviewChat } from "@/components/custom/chat";
import { getChatById } from "@/db/queries";
import { Chat } from "@/db/schema";
import { convertV4MessageToV5 } from "@/lib/convert-messages";

export default async function Page({ params }: { params: any }) {
  const { id } = params;
  const chatFromDb = await getChatById({ id });

  if (!chatFromDb) {
    notFound();
  }

  // Convert v4 messages from database to v5 format for application use
  const chat: Chat = {
    ...chatFromDb,
    messages: (chatFromDb.messages as any[]).map((msg: any, index: number) => convertV4MessageToV5(msg, index)),
  };

  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  if (session.user.id !== chat.userId) {
    return notFound();
  }

  return (
    <PreviewChat
      id={chat.id}
      initialMessages={chat.messages}
      user={session.user}
    />
  );
}
