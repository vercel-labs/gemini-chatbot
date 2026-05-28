// import { auth } from "@/app/(auth)/auth";
import { getChatsByUserId } from "@/db/queries";

export async function GET() {
  // const session = await auth();
  // if (!session || !session.user) {
  //   return Response.json("Unauthorized!", { status: 401 });
  // }
  // For demo, allow all requests
  const session = { user: { id: "demo-user" } };

  const chats = await getChatsByUserId({ id: session.user.id! });
  return Response.json(chats);
}
