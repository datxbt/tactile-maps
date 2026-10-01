"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { editorContent } from "@/data/content";

type AiEditBoxProps = {
  onSubmit: (instruction: string) => Promise<void>;
};

// Sends a plain-English instruction to the edit agent.
export function AiEditBox({ onSubmit }: AiEditBoxProps) {
  const [instruction, setInstruction] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setError(null);
    try {
      await onSubmit(instruction.trim());
      setInstruction("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setWorking(false);
    }
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <Label htmlFor="ai-instruction">{editorContent.aiTitle}</Label>
      <Textarea
        disabled={working}
        id="ai-instruction"
        onChange={(event) => setInstruction(event.target.value)}
        placeholder={editorContent.aiPlaceholder}
        rows={3}
        value={instruction}
      />
      <Button disabled={working || !instruction.trim()} size="sm" type="submit">
        {working ? editorContent.aiWorking : editorContent.aiSubmit}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
