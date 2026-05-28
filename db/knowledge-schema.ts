import { InferSelectModel } from "drizzle-orm";
import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    integer,
    json,
    customType,
    pgEnum,
} from "drizzle-orm/pg-core";

// pgvector custom column type (768 dimensions — text-embedding-004)
export const vector = customType<{ data: number[]; driverData: string }>({
    dataType() {
        return "vector(768)";
    },
    toDriver(val: number[]) {
        return JSON.stringify(val);
    },
    fromDriver(val: unknown) {
        if (typeof val === "string") return JSON.parse(val) as number[];
        return val as number[];
    },
});

export const sourceTypeEnum = pgEnum("source_type", [
    "pdf",
    "docx",
    "xlsx",
    "txt",
    "md",
]);

export const knowledgeDocument = pgTable("KnowledgeDocument", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    sourceType: sourceTypeEnum("sourceType").notNull(),
    department: varchar("department", { length: 100 }),
    roleLevel: varchar("roleLevel", { length: 100 }),
    uploadedAt: timestamp("uploadedAt").notNull().defaultNow(),
    metadata: json("metadata"),
});

export type KnowledgeDocument = InferSelectModel<typeof knowledgeDocument>;

export const knowledgeChunk = pgTable("KnowledgeChunk", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    documentId: uuid("documentId")
        .notNull()
        .references(() => knowledgeDocument.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    embedding: vector("embedding").notNull(),
    chunkIndex: integer("chunkIndex").notNull(),
    metadata: json("metadata"),
});

export type KnowledgeChunk = InferSelectModel<typeof knowledgeChunk>;
