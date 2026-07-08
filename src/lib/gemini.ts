import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export function getGeminiModel(overrideModel?: string) {
  return genAI.getGenerativeModel({
    model: overrideModel ?? env.GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
}
