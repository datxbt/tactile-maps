"use client";

import { featureKinds } from "@capstone/shared";
import { Button } from "@/components/ui/button";
import { editorContent } from "@/data/content";
import type { Tool } from "@/lib/floor-edit";

type EditorToolbarProps = {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
};

export function EditorToolbar({ tool, onToolChange }: EditorToolbarProps) {
  const tools: { id: Tool; label: string }[] = [
    { id: "select", label: editorContent.tools.select },
    { id: "wall", label: editorContent.tools.wall },
    { id: "door", label: editorContent.tools.door },
    ...featureKinds.map((kind) => ({ id: kind, label: editorContent.featureTools[kind] })),
  ];

  return (
    <div className="flex flex-wrap gap-2" role="toolbar">
      {tools.map((item) => (
        <Button
          aria-pressed={tool === item.id}
          key={item.id}
          onClick={() => onToolChange(item.id)}
          size="sm"
          variant={tool === item.id ? "default" : "outline"}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
