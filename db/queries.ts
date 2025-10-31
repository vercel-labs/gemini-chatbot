import "server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { user, chat, User, reservation } from "./schema";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
let db = drizzle(client);

/**
 * Get user by email address
 * @param email - User's email address
 * @returns Promise resolving to array of users
 */
export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    throw new Error(`Failed to get user from database: ${error}`);
  }
}

/**
 * Create a new user with hashed password
 * @param email - User's email address
 * @param password - Plain text password
 * @returns Promise resolving to database insert result
 */
export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    throw new Error(`Failed to create user in database: ${error}`);
  }
}

/**
 * Save or update chat messages
 * @param params - Object containing chat id, messages, and user id
 * @returns Promise resolving to database operation result
 */
export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  try {
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id));

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages: JSON.stringify(messages),
        })
        .where(eq(chat.id, id));
    }

    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      messages: JSON.stringify(messages),
      userId,
    });
  } catch (error) {
    throw new Error(`Failed to save chat in database: ${error}`);
  }
}

/**
 * Delete chat by ID
 * @param params - Object containing chat id
 * @returns Promise resolving to database delete result
 */
export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    throw new Error(`Failed to delete chat by id from database: ${error}`);
  }
}

/**
 * Get all chats for a specific user
 * @param params - Object containing user id
 * @returns Promise resolving to array of chats ordered by creation date
 */
export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    throw new Error(`Failed to get chats by user from database: ${error}`);
  }
}

/**
 * Get chat by ID
 * @param params - Object containing chat id
 * @returns Promise resolving to chat object or undefined
 */
export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    throw new Error(`Failed to get chat by id from database: ${error}`);
  }
}

/**
 * Create a new flight reservation
 * @param params - Object containing reservation details
 * @returns Promise resolving to database insert result
 */
export async function createReservation({
  id,
  userId,
  details,
}: {
  id: string;
  userId: string;
  details: any;
}) {
  try {
    return await db.insert(reservation).values({
      id,
      createdAt: new Date(),
      userId,
      hasCompletedPayment: false,
      details: JSON.stringify(details),
    });
  } catch (error) {
    throw new Error(`Failed to create reservation: ${error}`);
  }
}

/**
 * Get reservation by ID
 * @param params - Object containing reservation id
 * @returns Promise resolving to reservation object or undefined
 */
export async function getReservationById({ id }: { id: string }) {
  try {
    const [selectedReservation] = await db
      .select()
      .from(reservation)
      .where(eq(reservation.id, id));

    return selectedReservation;
  } catch (error) {
    throw new Error(`Failed to get reservation by id: ${error}`);
  }
}

/**
 * Update reservation payment status
 * @param params - Object containing reservation id and payment status
 * @returns Promise resolving to database update result
 */
export async function updateReservation({
  id,
  hasCompletedPayment,
}: {
  id: string;
  hasCompletedPayment: boolean;
}) {
  try {
    return await db
      .update(reservation)
      .set({
        hasCompletedPayment,
      })
      .where(eq(reservation.id, id));
  } catch (error) {
    throw new Error(`Failed to update reservation: ${error}`);
  }
}
