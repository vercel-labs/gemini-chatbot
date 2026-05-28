import "server-only";

import { embed, embedMany } from "ai";

import { embeddingModel } from "@/ai";
import { searchSimilarChunks } from "@/db/knowledge-queries";

/**
 * Generate an embedding vector for a single text string.
 */
export async function embedText(text: string): Promise<number[]> {
    const { embedding } = await embed({
        model: embeddingModel,
        value: text,
    });
    return embedding;
}

/**
 * Generate embedding vectors for a batch of text strings.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
    const { embeddings } = await embedMany({
        model: embeddingModel,
        values: texts,
    });
    return embeddings;
}

/**
 * Chunk text into overlapping segments for embedding.
 * Recursively splits on paragraph → line → sentence → word boundaries.
 */
export function chunkText(
    text: string,
    chunkSize = 2000,
    overlap = 200,
): string[] {
    const separators = ["\n\n", "\n", ". ", " "];
    const chunks: string[] = [];

    function split(remaining: string, sepIndex: number) {
        if (remaining.length <= chunkSize) {
            chunks.push(remaining.trim());
            return;
        }
        const sep = separators[sepIndex] ?? "";
        const parts = sep ? remaining.split(sep) : remaining.split("");
        let current = "";
        for (const part of parts) {
            const candidate = current ? current + sep + part : part;
            if (candidate.length <= chunkSize) {
                current = candidate;
            } else {
                if (current) {
                    chunks.push(current.trim());
                    // carry overlap from end of current chunk
                    const overlapText = current.slice(-overlap);
                    current = overlapText + sep + part;
                } else {
                    // single part too large — recurse with next separator
                    if (sepIndex + 1 < separators.length) {
                        split(part, sepIndex + 1);
                    } else {
                        chunks.push(part.slice(0, chunkSize).trim());
                    }
                    current = "";
                }
            }
        }
        if (current.trim()) chunks.push(current.trim());
    }

    split(text, 0);
    return chunks.filter((c) => c.length > 0);
}

/**
 * Retrieve relevant knowledge chunks via semantic similarity search.
 * Returns a formatted context string ready for injection into a system prompt.
 *
 * Dept-scoping rules:
 * - Pass department to restrict results to dept-specific + global docs
 * - C-level: use "Executive / C-Suite" to get executive + global docs
 */
export async function retrieveContext({
    query,
    department,
    topK = 5,
}: {
    query: string;
    department?: string;
    topK?: number;
}): Promise<string> {
    const queryEmbedding = await embedText(query);
    const chunks = await searchSimilarChunks({
        embedding: queryEmbedding,
        department,
        topK,
    });

    if (chunks.length === 0) {
        return "No relevant documentation found in the knowledge base for this query.";
    }

    return chunks
        .map(
            (c, i) =>
                `[Source ${i + 1}: ${c.documentTitle ?? "E.U.Z Knowledge Base"}]\n${c.content}`,
        )
        .join("\n\n---\n\n");
}
