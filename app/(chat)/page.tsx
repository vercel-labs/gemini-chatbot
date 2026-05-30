import type { Metadata } from "next";

import { Chat } from "@/components/custom/chat";
import { generateUUID } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gemini Reasoning",
};

export default async function Page() {
  const id = generateUUID();
  return <Chat key={id} id={id} initialMessages={[]} />;
}
