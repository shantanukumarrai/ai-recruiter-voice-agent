"use server";

import { groqTranscribeAudio } from "@/lib/groq";
import { startInterview, submitCandidateAnswer } from "@/services/interview-session.service";
import type { Message } from "@prisma/client";

export interface InterviewTurnResult {
  success: boolean;
  error?: string;
  transcript?: string;
  nextMessage?: Message | null;
  done?: boolean;
}

/**
 * These actions are intentionally NOT gated by requireCurrentUser() — the
 * candidate is anonymous and authorizes solely via the unguessable
 * accessToken embedded in their interview link (see prisma schema:
 * Interview.accessToken is a unique cuid()).
 */
export async function startInterviewAction(accessToken: string): Promise<InterviewTurnResult> {
  try {
    const { messages } = await startInterview(accessToken);
    return { success: true, nextMessage: messages[messages.length - 1] ?? null };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Could not start the interview. The link may be invalid." };
  }
}

export async function submitAudioAnswerAction(
  accessToken: string,
  formData: FormData
): Promise<InterviewTurnResult> {
  const audioFile = formData.get("audio");
  if (!(audioFile instanceof Blob)) {
    return { success: false, error: "No audio was recorded." };
  }

  try {
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const transcript = await groqTranscribeAudio(buffer, "answer.webm");

    if (!transcript.trim()) {
      return { success: false, error: "We couldn't hear anything. Please try recording again." };
    }

    const result = await submitCandidateAnswer(accessToken, transcript);
    return {
      success: true,
      transcript,
      nextMessage: result.nextMessage,
      done: result.done,
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Something went wrong processing your answer. Please try again." };
  }
}
