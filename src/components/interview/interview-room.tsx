"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startInterviewAction, submitAudioAnswerAction } from "@/actions/interview-session.actions";
import { cn } from "@/lib/utils";
import type { Message } from "@prisma/client";

type Phase = "idle" | "ai-speaking" | "ready-to-record" | "recording" | "processing" | "done" | "error";

interface DisplayMessage {
  id: string;
  sender: "AI" | "CANDIDATE";
  content: string;
}

function speak(text: string, onEnd: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}

export function InterviewRoom({
  accessToken,
  candidateFirstName,
  jobTitle,
  alreadyCompleted,
}: {
  accessToken: string;
  candidateFirstName: string;
  jobTitle: string;
  alreadyCompleted: boolean;
}) {
  const [phase, setPhase] = useState<Phase>(alreadyCompleted ? "done" : "idle");
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function appendMessage(msg: DisplayMessage) {
    setMessages((prev) => [...prev, msg]);
  }

  async function handleStart() {
    setPhase("ai-speaking");
    const result = await startInterviewAction(accessToken);
    if (!result.success || !result.nextMessage) {
      setErrorText(result.error ?? "Could not start the interview.");
      setPhase("error");
      return;
    }
    const aiMsg = result.nextMessage;
    appendMessage({ id: aiMsg.id, sender: "AI", content: aiMsg.content });
    speak(aiMsg.content, () => setPhase("ready-to-record"));
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setPhase("recording");
    } catch {
      setErrorText("Microphone access is required to answer. Please allow microphone permissions and try again.");
      setPhase("error");
    }
  }, []);

  function stopRecordingAndSubmit() {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.onstop = async () => {
      recorder.stream.getTracks().forEach((track) => track.stop());
      setPhase("processing");

      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", blob, "answer.webm");

      const result = await submitAudioAnswerAction(accessToken, formData);
      if (!result.success) {
        setErrorText(result.error ?? "Something went wrong.");
        setPhase("error");
        return;
      }

      appendMessage({
        id: `candidate-${Date.now()}`,
        sender: "CANDIDATE",
        content: result.transcript ?? "",
      });

      if (result.done || !result.nextMessage) {
        if (result.nextMessage) {
          appendMessage({ id: result.nextMessage.id, sender: "AI", content: result.nextMessage.content });
          speak(result.nextMessage.content, () => setPhase("done"));
        } else {
          setPhase("done");
        }
        return;
      }

      appendMessage({ id: result.nextMessage.id, sender: "AI", content: result.nextMessage.content });
      setPhase("ai-speaking");
      speak(result.nextMessage.content, () => setPhase("ready-to-record"));
    };

    recorder.stop();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-semibold">AI Interview — {jobTitle}</h1>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-border bg-card p-5">
        {messages.length === 0 && phase === "idle" && (
          <p className="text-center text-sm text-muted-foreground">
            Hi {candidateFirstName}, click below when you&apos;re ready to begin. Make sure your
            microphone is enabled.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.sender === "AI" ? "justify-start" : "justify-end")}>
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-4 py-2 text-sm",
                m.sender === "AI" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        {phase === "idle" && (
          <Button size="lg" onClick={handleStart}>
            Start Interview
          </Button>
        )}

        {phase === "ai-speaking" && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Interviewer is speaking...
          </p>
        )}

        {phase === "ready-to-record" && (
          <Button size="lg" onClick={startRecording}>
            <Mic className="h-4 w-4" /> Record Answer
          </Button>
        )}

        {phase === "recording" && (
          <Button size="lg" variant="destructive" onClick={stopRecordingAndSubmit}>
            <Square className="h-4 w-4" /> Stop &amp; Submit
          </Button>
        )}

        {phase === "processing" && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Processing your answer...
          </p>
        )}

        {phase === "done" && (
          <p className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" /> Interview complete. Thank you!
          </p>
        )}

        {phase === "error" && (
          <div className="text-center">
            <p className="text-sm text-destructive">{errorText}</p>
            <Button className="mt-3" variant="outline" onClick={() => setPhase("idle")}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
