import { InferSelectModel } from "drizzle-orm";
import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    integer,
    boolean,
    json,
    pgEnum,
} from "drizzle-orm/pg-core";

import { user } from "./schema";
import { chat } from "./schema";

export const sessionStatusEnum = pgEnum("session_status", [
    "in_progress",
    "completed",
]);

export const webhookStatusEnum = pgEnum("webhook_status", [
    "pending",
    "delivered",
    "failed",
]);

export const onboardingStep = pgTable("OnboardingStep", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    department: varchar("department", { length: 100 }).notNull(),
    roleLevel: varchar("roleLevel", { length: 100 }),
    stepOrder: integer("stepOrder").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    isRequired: boolean("isRequired").notNull().default(true),
});

export type OnboardingStep = InferSelectModel<typeof onboardingStep>;

export const onboardingSession = pgTable("OnboardingSession", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
        .notNull()
        .references(() => user.id),
    department: varchar("department", { length: 100 }).notNull(),
    roleLevel: varchar("roleLevel", { length: 100 }).notNull(),
    employeeName: varchar("employeeName", { length: 128 }),
    status: sessionStatusEnum("status").notNull().default("in_progress"),
    startedAt: timestamp("startedAt").notNull().defaultNow(),
    completedAt: timestamp("completedAt"),
    chatId: uuid("chatId").references(() => chat.id),
});

export type OnboardingSession = InferSelectModel<typeof onboardingSession>;

export const onboardingProgress = pgTable("OnboardingProgress", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    sessionId: uuid("sessionId")
        .notNull()
        .references(() => onboardingSession.id, { onDelete: "cascade" }),
    stepId: uuid("stepId")
        .notNull()
        .references(() => onboardingStep.id),
    completedAt: timestamp("completedAt").defaultNow(),
    notes: text("notes"),
});

export type OnboardingProgress = InferSelectModel<typeof onboardingProgress>;

export const webhookEvent = pgTable("WebhookEvent", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    sessionId: uuid("sessionId")
        .notNull()
        .references(() => onboardingSession.id, { onDelete: "cascade" }),
    eventType: varchar("eventType", { length: 64 }).notNull(),
    payload: json("payload").notNull(),
    status: webhookStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    deliveredAt: timestamp("deliveredAt"),
});

export type WebhookEvent = InferSelectModel<typeof webhookEvent>;
