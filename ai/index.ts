import { google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";

import { customMiddleware } from "./custom-middleware";

const llmProvider = (process.env.LLM_PROVIDER ?? "huggingface").toLowerCase();

const hf = createOpenAI({
  apiKey: process.env.HUGGINGFACE_API_KEY ?? "",
  baseURL: process.env.HUGGINGFACE_BASE_URL ?? "https://router.huggingface.co/v1",
});

const chatModel =
  llmProvider === "huggingface" && process.env.HUGGINGFACE_API_KEY
    ? hf(process.env.HUGGINGFACE_MODEL ?? "meta-llama/Llama-3.1-8B-Instruct")
    : google("gemini-2.5-pro");

const objectModel =
  llmProvider === "huggingface" && process.env.HUGGINGFACE_API_KEY
    ? hf(
      process.env.HUGGINGFACE_FAST_MODEL ??
      process.env.HUGGINGFACE_MODEL ??
      "meta-llama/Llama-3.1-8B-Instruct",
    )
    : google("gemini-2.5-flash");

export const geminiProModel = wrapLanguageModel({
  model: chatModel,
  middleware: customMiddleware,
});

export const geminiFlashModel = wrapLanguageModel({
  model: objectModel,
  middleware: customMiddleware,
});

// Embedding model for the RAG knowledge base (768 dimensions)
export const embeddingModel = google.textEmbeddingModel("text-embedding-004");
