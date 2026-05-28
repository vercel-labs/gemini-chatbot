import "server-only";

import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getPostgresUrl } from "@/lib/db-url";
import { knowledgeChunk, knowledgeDocument } from "./knowledge-schema";

const client = postgres(getPostgresUrl());
const db = drizzle(client);

export async function upsertKnowledgeDocument({
    title,
    sourceType,
    department,
    roleLevel,
    metadata,
}: {
    title: string;
    sourceType: "pdf" | "docx" | "xlsx" | "txt" | "md";
    department?: string;
    roleLevel?: string;
    metadata?: Record<string, unknown>;
}) {
    try {
        const [doc] = await db
            .insert(knowledgeDocument)
            .values({
                title,
                sourceType,
                department: department ?? null,
                roleLevel: roleLevel ?? null,
                metadata: metadata ?? null,
            })
            .returning();
        return doc;
    } catch (error) {
        console.error("Failed to upsert knowledge document");
        throw error;
    }
}

export async function insertKnowledgeChunks(
    chunks: {
        documentId: string;
        content: string;
        embedding: number[];
        chunkIndex: number;
        metadata?: Record<string, unknown>;
    }[],
) {
    try {
        return await db.insert(knowledgeChunk).values(
            chunks.map((c) => ({
                documentId: c.documentId,
                content: c.content,
                embedding: c.embedding,
                chunkIndex: c.chunkIndex,
                metadata: c.metadata ?? null,
            })),
        );
    } catch (error) {
        console.error("Failed to insert knowledge chunks");
        throw error;
    }
}

export async function searchSimilarChunks({
    embedding,
    department,
    topK = 5,
}: {
    embedding: number[];
    department?: string;
    topK?: number;
}) {
    try {
        const embeddingStr = JSON.stringify(embedding);
        type SimilarChunkRow = {
            id: string;
            content: string;
            metadata: Record<string, unknown> | null;
            documentTitle: string;
            department: string | null;
            distance: number;
        };

        // Use raw SQL for pgvector cosine distance operator <=>
        const rows = await db.execute(sql`
      SELECT
        kc.id,
        kc.content,
        kc.metadata,
        kd.title AS "documentTitle",
        kd.department,
        kc.embedding <=> ${embeddingStr}::vector AS distance
      FROM "KnowledgeChunk" kc
      JOIN "KnowledgeDocument" kd ON kd.id = kc."documentId"
      WHERE (
        kd.department IS NULL
        OR kd.department = ${department ?? null}
      )
      ORDER BY distance ASC
      LIMIT ${topK}
    `);

        return Array.from(rows).map((row) => {
            const r = row as Record<string, unknown>;
            return {
                id: String(r.id),
                content: String(r.content),
                metadata: (r.metadata as Record<string, unknown> | null) ?? null,
                documentTitle: String(r.documentTitle),
                department: (r.department as string | null) ?? null,
                distance: Number(r.distance),
            } satisfies SimilarChunkRow;
        });
    } catch (error) {
        console.error("Failed to search similar chunks");
        throw error;
    }
}

export async function getDocumentsByDepartment(department: string | null) {
    try {
        return await db
            .select()
            .from(knowledgeDocument)
            .where(
                department
                    ? eq(knowledgeDocument.department, department)
                    : sql`${knowledgeDocument.department} IS NULL`,
            );
    } catch (error) {
        console.error("Failed to get documents by department");
        throw error;
    }
}

export async function deleteKnowledgeDocumentByTitle(title: string) {
    try {
        return await db
            .delete(knowledgeDocument)
            .where(eq(knowledgeDocument.title, title));
    } catch (error) {
        console.error("Failed to delete knowledge document");
        throw error;
    }
}
