"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SkillsInputProps {
  name: string;
  defaultValue?: string[];
  error?: string;
}

export function SkillsInput({ name, defaultValue = [], error }: SkillsInputProps) {
  const [skills, setSkills] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState("");

  function addSkill(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setDraft("");
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(draft);
    } else if (e.key === "Backspace" && draft === "" && skills.length > 0) {
      removeSkill(skills[skills.length - 1]!);
    }
  }

  return (
    <div>
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 shadow-sm focus-within:ring-1 focus-within:ring-ring",
          error && "border-destructive"
        )}
      >
        {skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="gap-1 pr-1">
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="rounded-full p-0.5 hover:bg-muted-foreground/20"
              aria-label={`Remove ${skill}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addSkill(draft)}
          placeholder={skills.length === 0 ? "Type a skill and press Enter..." : ""}
          className="min-w-[120px] flex-1 border-0 bg-transparent p-1 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      {/* Hidden field is what the server action actually reads via FormData. */}
      <input type="hidden" name={name} value={skills.join(",")} />
    </div>
  );
}
