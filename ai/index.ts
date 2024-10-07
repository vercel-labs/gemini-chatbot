// import { openai } from "@ai-sdk/openai";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";
import { ragMiddleware } from "./rag-middleware";
import { google } from "@ai-sdk/google";

export const customModel = wrapLanguageModel({
  model: google("gemini-1.5-pro-002"),
  middleware: ragMiddleware,
});
