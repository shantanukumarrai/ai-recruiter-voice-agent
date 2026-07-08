import { groqGenerateJSON } from "@/lib/groq";
import { resumeExtractionSchema, type ResumeExtraction } from "@/validators/candidate.validator";

/**
 * Downloads the resume file and extracts raw text. Supports PDF and DOCX —
 * the two formats we accept in the UploadThing file router.
 */
export async function extractResumeText(fileUrl: string, fileName: string): Promise<string> {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to download resume: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const isDocx = fileName.toLowerCase().endsWith(".docx");

  if (isDocx) {
    // Dynamic import: mammoth does file-system probing at module load time
    // in some environments, so we only pull it in when actually needed.
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // Default to PDF. Dynamic import avoids pdf-parse's known issue of
  // eagerly touching a bundled test fixture on `require()` at build time.
  const pdfParse = (await import("pdf-parse")).default;
  const result = await pdfParse(buffer);
  return result.text;
}

const EXTRACTION_PROMPT = `You are an expert resume parser. Extract structured information from the resume text below.

Return ONLY valid JSON matching this exact shape, with no markdown fences and no commentary:
{
  "name": string,
  "email": string | null,
  "phone": string | null,
  "skills": string[],
  "experience": [{ "company": string, "title": string, "duration": string, "description": string }],
  "education": [{ "institution": string, "degree": string, "field": string, "year": string }],
  "projects": [{ "name": string, "description": string, "techStack": string[] }]
}

Rules:
- If a field genuinely cannot be found, use null (for name/email/phone use your best guess; email/phone can be null if truly absent).
- "skills" should be a flat deduplicated list of technical and soft skills mentioned anywhere in the resume.
- Do not invent information that is not present in the resume text.

Resume text:
"""
{{RESUME_TEXT}}
"""`;

/**
 * Sends resume text to Gemini and validates the JSON it returns against
 * our schema. If Gemini returns malformed JSON or a shape mismatch, we
 * retry once with a stricter reminder before giving up — LLM JSON output
 * is usually correct but not 100% of the time.
 */
export async function extractStructuredResumeData(resumeText: string): Promise<ResumeExtraction> {
  const truncated = resumeText.slice(0, 15_000); // keep prompt cost/size sane
  const prompt = EXTRACTION_PROMPT.replace("{{RESUME_TEXT}}", truncated);

  const attempt = async (extraInstruction = ""): Promise<ResumeExtraction> => {
    const rawText = await groqGenerateJSON(prompt + extraInstruction);

    let json: unknown;
    try {
      json = JSON.parse(rawText);
    } catch {
      throw new Error("AI_RESPONSE_NOT_JSON");
    }

    const parsed = resumeExtractionSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error("AI_RESPONSE_SCHEMA_MISMATCH");
    }
    return parsed.data;
  };

  try {
    return await attempt();
  } catch {
    // One retry with a firmer nudge — cheap insurance against occasional
    // formatting slips (e.g. a stray markdown fence).
    return attempt(
      "\n\nReminder: respond with ONLY the raw JSON object. No ```json fences, no prose before or after."
    );
  }
}

export async function parseResumeFromUrl(fileUrl: string, fileName: string): Promise<{
  resumeText: string;
  extraction: ResumeExtraction;
}> {
  const resumeText = await extractResumeText(fileUrl, fileName);
  if (!resumeText.trim()) {
    throw new Error("RESUME_TEXT_EMPTY");
  }
  const extraction = await extractStructuredResumeData(resumeText);
  return { resumeText, extraction };
}
