import { groqGenerateJSON } from "@/lib/groq";
import type { Candidate, Job, Message, MessageStage } from "@prisma/client";

/**
 * Fixed conversation stage order. One AI turn per stage keeps the
 * interview a predictable length (~8 exchanges) while still letting each
 * question be dynamically generated and tailored to this specific
 * candidate and job — the "FOLLOW_UP" stage is where the AI reacts
 * directly to the candidate's technical answer rather than asking a
 * pre-written question.
 */
export const STAGE_SEQUENCE: MessageStage[] = [
  "GREETING",
  "IDENTITY_VERIFICATION",
  "INTRODUCTION",
  "TECHNICAL",
  "FOLLOW_UP",
  "BEHAVIORAL",
  "CROSS_QUESTION",
  "CONCLUSION",
];

export function getNextStage(currentStage: MessageStage): MessageStage | null {
  const index = STAGE_SEQUENCE.indexOf(currentStage);
  if (index === -1 || index === STAGE_SEQUENCE.length - 1) return null;
  return STAGE_SEQUENCE[index + 1]!;
}

const STAGE_INSTRUCTIONS: Record<MessageStage, string> = {
  GREETING:
    "Greet the candidate warmly by first name, introduce yourself as the AI interviewer for this role, and briefly explain the interview will take about 15-20 minutes. Keep it to 2-3 sentences.",
  IDENTITY_VERIFICATION:
    "Ask the candidate to confirm their full name and the role they're interviewing for, as a quick identity check before starting. One short sentence.",
  INTRODUCTION:
    "Ask the candidate to briefly introduce themselves and walk you through their background, in their own words.",
  TECHNICAL:
    "Ask ONE specific technical question directly relevant to the job's required skills and the candidate's resume. Reference a specific skill or project from their resume if possible. Keep it focused and answerable in 1-2 minutes.",
  FOLLOW_UP:
    "Based on the candidate's most recent (technical) answer, ask ONE natural follow-up question that digs deeper into something they said. Do not repeat the previous question.",
  BEHAVIORAL:
    "Ask ONE behavioral question (e.g. teamwork, conflict, ownership, handling pressure) relevant to the seniority of this role.",
  CROSS_QUESTION:
    "Ask ONE clarifying or probing cross-question based on something specific the candidate said earlier in this conversation.",
  CONCLUSION:
    "Thank the candidate warmly for their time, let them know the recruiting team will review their interview and follow up soon, and close the interview. 2-3 sentences.",
};

const SYSTEM_PROMPT = `You are a professional, warm, and sharp AI technical recruiter conducting a live voice interview. You ask exactly one question or statement per turn, in natural spoken English, as if speaking out loud. Never break character, never mention you are an AI language model, never output anything except the interviewer's next spoken line.

Return ONLY valid JSON: { "message": string }. No markdown, no commentary.`;

export async function generateInterviewerTurn(params: {
  job: Job;
  candidate: Candidate;
  history: Message[];
  stage: MessageStage;
}): Promise<string> {
  const { job, candidate, history, stage } = params;

  const transcript = history
    .map((m) => `${m.sender === "AI" ? "Interviewer" : "Candidate"}: ${m.content}`)
    .join("\n");

  const prompt = `${SYSTEM_PROMPT}

Job Title: ${job.title}
Job Description: ${job.description.slice(0, 2000)}
Required Skills: ${job.skills.join(", ")}

Candidate Name: ${candidate.name}
Candidate Skills: ${candidate.skills.join(", ")}
Candidate Resume Summary: ${(candidate.resumeText ?? "").slice(0, 3000)}

Conversation so far:
${transcript || "(interview has not started yet)"}

Current stage: ${stage}
Instruction for this turn: ${STAGE_INSTRUCTIONS[stage]}`;

  const rawText = await groqGenerateJSON(prompt);
  try {
    const parsed = JSON.parse(rawText);
    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message.trim();
    }
  } catch {
    // fall through to retry
  }

  const retryText = await groqGenerateJSON(
    prompt + '\n\nReminder: respond with ONLY {"message": "..."} — no other text.'
  );
  const retryParsed = JSON.parse(retryText);
  return retryParsed.message.trim();
}
