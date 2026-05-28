/**
 * scripts/seed-knowledge.ts
 *
 * Walks the knowledge/ directory tree, parses documents (PDF, DOCX, XLSX, TXT, MD),
 * chunks the extracted text, generates embeddings via Google text-embedding-004,
 * and upserts records into KnowledgeDocument + KnowledgeChunk tables.
 *
 * Directory structure convention:
 *   knowledge/<department-slug>/<filename>.<ext>
 *   knowledge/global/<filename>.<ext>   ← applies to all departments
 *
 * Run with: npx tsx scripts/seed-knowledge.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import fs from "fs";
import path from "path";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
    upsertKnowledgeDocument,
    insertKnowledgeChunks,
} from "../db/knowledge-queries";
import { getPostgresUrl } from "../lib/db-url";
import { embedTexts, chunkText } from "../ai/onboarding/rag";

const client = postgres(getPostgresUrl());
const db = drizzle(client);

const KNOWLEDGE_DIR = path.resolve(process.cwd(), "knowledge");
const BATCH_SIZE = 20; // embed up to 20 chunks per API call

// ─── Department slug → display name mapping ───────────────────────────────────
const DEPT_SLUG_MAP: Record<string, string> = {
    global: "", // null department = global
    "executive": "Executive / C-Suite",
    "engineering": "Engineering & Design",
    "project-management": "Project Management",
    "hse": "Health, Safety & Environment (HSE)",
    "procurement": "Procurement & Supply Chain",
    "finance": "Finance & Accounting",
    "hr": "Human Resources",
    "it": "IT & Digital",
    "operations": "Field Operations / Construction",
    "legal": "Legal & Compliance",
    "facilities": "Facilities / Cleaners & Support Staff",
};

type SourceType = "pdf" | "docx" | "xlsx" | "txt" | "md";

// ─── Parsers ──────────────────────────────────────────────────────────────────

async function extractText(
    filePath: string,
    ext: string,
): Promise<string> {
    const buffer = fs.readFileSync(filePath);

    switch (ext) {
        case ".pdf": {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require("pdf-parse");
            const data = await pdfParse(buffer);
            return data.text as string;
        }
        case ".docx": {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const mammoth = require("mammoth");
            const result = await mammoth.extractRawText({ buffer });
            return result.value as string;
        }
        case ".xlsx":
        case ".xls": {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const XLSX = require("xlsx");
            const wb = XLSX.read(buffer, { type: "buffer" });
            return wb.SheetNames.map((name: string) =>
                XLSX.utils.sheet_to_csv(wb.Sheets[name]),
            ).join("\n\n");
        }
        case ".txt":
        case ".md":
            return buffer.toString("utf-8");
        default:
            return "";
    }
}

function extToSourceType(ext: string): SourceType | null {
    const map: Record<string, SourceType> = {
        ".pdf": "pdf",
        ".docx": "docx",
        ".xlsx": "xlsx",
        ".xls": "xlsx",
        ".txt": "txt",
        ".md": "md",
    };
    return map[ext] ?? null;
}

// ─── Walk directory ────────────────────────────────────────────────────────────

function walkDir(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...walkDir(fullPath));
        } else {
            files.push(fullPath);
        }
    }
    return files;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
    const allFiles = walkDir(KNOWLEDGE_DIR);
    const supportedFiles = allFiles.filter((f) =>
        [".pdf", ".docx", ".xlsx", ".xls", ".txt", ".md"].includes(
            path.extname(f).toLowerCase(),
        ),
    );

    if (supportedFiles.length === 0) {
        console.log(
            "⚠️  No documents found in knowledge/. Add files and re-run.",
        );
        await client.end();
        return;
    }

    console.log(`⏳ Processing ${supportedFiles.length} document(s)…\n`);

    for (const filePath of supportedFiles) {
        const ext = path.extname(filePath).toLowerCase();
        const sourceType = extToSourceType(ext);
        if (!sourceType) continue;

        // Derive department from parent folder name
        const parts = path.relative(KNOWLEDGE_DIR, filePath).split(path.sep);
        const deptSlug = parts.length > 1 ? parts[0] : "global";
        const department = DEPT_SLUG_MAP[deptSlug] ?? null;
        const title = path.basename(filePath, ext);

        process.stdout.write(`  → ${title} (${deptSlug}) … `);

        let text: string;
        try {
            text = await extractText(filePath, ext);
        } catch (err) {
            console.error(`\n     ❌ Failed to parse: ${err}`);
            continue;
        }

        if (!text.trim()) {
            console.log("skipped (empty)");
            continue;
        }

        const chunks = chunkText(text);
        process.stdout.write(`${chunks.length} chunks … `);

        // Insert document record
        const doc = await upsertKnowledgeDocument({
            title,
            sourceType,
            department: department ?? undefined,
            metadata: { filePath: path.relative(process.cwd(), filePath) },
        });

        // Embed in batches
        for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
            const batch = chunks.slice(i, i + BATCH_SIZE);
            const embeddings = await embedTexts(batch);

            await insertKnowledgeChunks(
                batch.map((content, j) => ({
                    documentId: doc.id,
                    content,
                    embedding: embeddings[j],
                    chunkIndex: i + j,
                    metadata: { title, department: department ?? "global", chunkIndex: i + j },
                })),
            );
        }

        console.log("✅");
    }

    console.log("\n✅ Knowledge base seeding complete.");
    await client.end();
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
