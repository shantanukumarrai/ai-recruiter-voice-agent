"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { StickyNote, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createNoteAction, deleteNoteAction, type NoteActionState } from "@/actions/recruiter-note.actions";
import type { RecruiterNote, User } from "@prisma/client";

type NoteWithAuthor = RecruiterNote & { author: User };

const initialState: NoteActionState = { success: false };

export function RecruiterNotesCard({
  applicationId,
  candidateId,
  notes,
  currentUserId,
}: {
  applicationId: string;
  candidateId: string;
  notes: NoteWithAuthor[];
  currentUserId: string;
}) {
  const boundAction = createNoteAction.bind(null, applicationId, candidateId);
  const [state, formAction] = useActionState(boundAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <StickyNote className="h-4 w-4" /> Recruiter Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} className="space-y-2">
          <Textarea
            name="content"
            rows={3}
            placeholder="Add a private note about this candidate — interview impressions, follow-ups, concerns..."
          />
          {state.error && <p className="text-xs text-destructive">{state.error}</p>}
          <SubmitButton />
        </form>

        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                candidateId={candidateId}
                canDelete={note.authorId === currentUserId}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Saving..." : "Add Note"}
    </Button>
  );
}

function NoteItem({
  note,
  candidateId,
  canDelete,
}: {
  note: NoteWithAuthor;
  candidateId: string;
  canDelete: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const authorName = [note.author.firstName, note.author.lastName].filter(Boolean).join(" ") || note.author.email;

  return (
    <li className="rounded-lg border border-border p-3">
      <p className="whitespace-pre-wrap text-sm">{note.content}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {authorName} · {formatDistanceToNow(note.createdAt, { addSuffix: true })}
        </span>
        {canDelete && (
          <button
            disabled={isPending}
            onClick={() => startTransition(() => deleteNoteAction(note.id, candidateId))}
            className="flex items-center gap-1 hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        )}
      </div>
    </li>
  );
}
