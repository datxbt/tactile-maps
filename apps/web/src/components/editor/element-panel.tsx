"use client";

import { REVIEW_THRESHOLD } from "@capstone/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { editorContent, featureNames } from "@/data/content";
import type { FoundElement } from "@/lib/floor-edit";

type ElementPanelProps = {
  selected: FoundElement | null;
  onLabelChange: (label: string) => void;
  onDoorWidthChange: (width: number) => void;
  onMarkChecked: () => void;
  onDelete: () => void;
};

// Details of the selected element, with the edits that make sense for it.
export function ElementPanel({
  selected,
  onLabelChange,
  onDoorWidthChange,
  onMarkChecked,
  onDelete,
}: ElementPanelProps) {
  if (!selected) {
    return <p className="text-sm text-muted-foreground">{editorContent.noSelection}</p>;
  }

  const { kind, element } = selected;
  const needsReview = element.confidence < REVIEW_THRESHOLD;
  const title = kind === "feature" && "kind" in element
    ? `${editorContent.kinds.feature}: ${featureNames[element.kind]}`
    : editorContent.kinds[kind];

  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="font-medium">
        {title} <span className="font-mono text-muted-foreground">{element.id}</span>
      </p>
      <p className="text-muted-foreground">
        {editorContent.confidence}: {Math.round(element.confidence * 100)}%
      </p>
      {needsReview && <p className="text-amber-600">{editorContent.needsReview}</p>}

      {kind === "room" && "polygon" in element && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="room-label">{editorContent.label}</Label>
          <Input
            id="room-label"
            onChange={(event) => onLabelChange(event.target.value)}
            value={element.label ?? ""}
          />
        </div>
      )}

      {kind === "door" && "width" in element && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="door-width">{editorContent.doorWidth}</Label>
          <Input
            id="door-width"
            min={1}
            onChange={(event) => onDoorWidthChange(Number(event.target.value) || 1)}
            type="number"
            value={Math.round(element.width)}
          />
        </div>
      )}

      <div className="flex gap-2">
        {needsReview && (
          <Button onClick={onMarkChecked} size="sm" variant="outline">
            {editorContent.markChecked}
          </Button>
        )}
        <Button onClick={onDelete} size="sm" variant="destructive">
          {editorContent.delete}
        </Button>
      </div>
    </div>
  );
}
