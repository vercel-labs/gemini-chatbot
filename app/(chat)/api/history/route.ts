import { getAllChats } from "@/db/queries";

export async function GET() {
  const chats = await getAllChats();
  return Response.json(chats);
}
