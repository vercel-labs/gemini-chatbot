import { Chat } from "@/components/custom/chat";

export default async function Page() {
  const id = "initial-chat";
  const welcomeMessage = {
    id: "welcome-message",
    role: "assistant" as const,
    content:
      "👋 Hi! I’m Nelson-GPT — your trusted pediatric AI assistant. Ask me anything from the Nelson Textbook of Pediatrics.",
  };
  return <Chat key={id} id={id} initialMessages={[welcomeMessage]} />;
}
