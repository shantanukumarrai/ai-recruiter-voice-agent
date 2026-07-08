import { env } from "@/lib/env";

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_TRANSCRIPTIONS_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

/**
 * Sends a single-turn prompt to Groq and asks for a raw JSON response.
 * Groq exposes an OpenAI-compatible REST API, so we call it directly with
 * fetch rather than pulling in the full OpenAI SDK for one endpoint.
 */
export async function groqGenerateJSON(prompt: string, overrideModel?: string): Promise<string> {
  const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: overrideModel ?? env.GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Groq API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Groq response did not contain message content");
  }
  return content;
}

/**
 * Transcribes an audio clip using Groq's hosted Whisper model — this is
 * the "Whisper Speech-to-Text" piece from the spec, running on Groq's free
 * tier rather than OpenAI's paid Whisper API.
 */
export async function groqTranscribeAudio(audioBuffer: Buffer, fileName: string): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([audioBuffer], { type: "audio/webm" });
  formData.append("file", blob, fileName);
  formData.append("model", "whisper-large-v3-turbo");
  formData.append("response_format", "text");

  const response = await fetch(GROQ_TRANSCRIPTIONS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.GROQ_API_KEY}` },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Groq transcription error (${response.status}): ${errorBody}`);
  }

  const text = await response.text();
  return text.trim();
}
