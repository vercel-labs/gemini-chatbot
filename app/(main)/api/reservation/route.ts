import { auth } from "@/app/(auth)/auth";
import { getReservationById, updateReservation } from "@/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found!", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized!", { status: 401 });
  }

  try {
    const reservation = await getReservationById({ id });

    if (reservation.userId !== session.user.id) {
      return new Response("Unauthorized!", { status: 401 });
    }

    return Response.json(reservation);
  } catch (error) {
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found!", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized!", { status: 401 });
  }

  try {
    const reservation = await getReservationById({ id });

    if (!reservation) {
      return new Response("Reservation not found!", { status: 404 });
    }

    if (reservation.userId !== session.user.id) {
      return new Response("Unauthorized!", { status: 401 });
    }

    if (reservation.hasCompletedPayment) {
      return new Response("Reservation is already paid!", { status: 409 });
    }

    const { magicWord } = await request.json();

    if (magicWord.toLowerCase() !== "vercel") {
      return new Response("Invalid magic word!", { status: 400 });
    }

    const updatedReservation = await updateReservation({
      id,
      hasCompletedPayment: true,
    });
    return Response.json(updatedReservation);
  } catch (error) {
    console.error("Error updating reservation:", error);
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}
