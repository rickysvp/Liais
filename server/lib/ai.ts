import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
  console.warn("[WARN] GEMINI_API_KEY is not configured. AI features will be disabled.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "disabled" });

export function isAIConfigured(): boolean {
  return !!apiKey && apiKey !== "MY_GEMINI_API_KEY";
}
