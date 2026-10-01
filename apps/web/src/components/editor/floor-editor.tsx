"use client";

import type { FloorModel, Point, Project } from "@capstone/shared";
import { useEffect, useState } from "react";
import { AiEditBox } from "@/components/editor/ai-edit-box";
import { EditorCanvas } from "@/components/editor/editor-canvas";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { ElementPanel } from "@/components/editor/element-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { editorContent } from "@/data/content";
import { imageUrl, projectsApi } from "@/lib/api";
import {
  findElement,
  idsNeedingReview,
  movePoint,
  newId,
  removeElement,
  updateElement,
  type Tool,
} from "@/lib/floor-edit";

type FloorEditorProps = {
  project: Project & { model: FloorModel };
  onSaved: (project: Project) => void;
};

// Step 1: review what the parser agent found and fix it. Changes stay in
// this component (the "draft") until the user presses Save.
export function FloorEditor({ project, onSaved }: FloorEditorProps) {
  const [model, setModel] = useState(project.model);
  const [dirty, setDirty] = useState(false);
  const [tool, setTool] = useState<Tool>("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wallStart, setWallStart] = useState<Point | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = selectedId ? findElement(model, selectedId) : null;
  const reviewIds = idsNeedingReview(model);

  function change(next: FloorModel) {
    setModel(next);
    setDirty(true);
  }

  function chooseTool(next: Tool) {
    setTool(next);
    setWallStart(null);
    if (next !== "select") setSelectedId(null);
  }

  function deleteSelected() {
    if (!selectedId) return;
    change(removeElement(model, selectedId));
    setSelectedId(null);
  }

  // Clicking the plan with an "add" tool creates a new element there.
  function handlePlanClick(point: Point) {
    const at = { x: Math.round(point.x), y: Math.round(point.y) };
    if (tool === "wall") {
      if (!wallStart) return setWallStart(at);
      const id = newId(model, "w");
      change({ ...model, walls: [...model.walls, { id, a: wallStart, b: at, confidence: 1 }] });
      setWallStart(null);
    } else if (tool === "door") {
      const id = newId(model, "d");
      const width = Math.round(Math.max(model.widthPx, model.heightPx) * 0.045);
      change({ ...model, doors: [...model.doors, { id, at, width, confidence: 1 }] });
    } else if (tool !== "select") {
      const id = newId(model, "f");
      change({ ...model, features: [...model.features, { id, kind: tool, at, confidence: 1 }] });
    }
  }

  // Keyboard: Delete removes the selection, Escape cancels.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.target as HTMLElement).closest("input, textarea")) return;
      if (event.key === "Delete" || event.key === "Backspace") deleteSelected();
      if (event.key === "Escape") {
        setWallStart(null);
        setSelectedId(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function save() {
    setSaving(true);
    setError(null);
    try {
      onSaved(await projectsApi.saveModel(project.id, model));
      setDirty(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setSaving(false);
    }
  }

  async function aiEdit(instruction: string) {
    // Save first so the agent edits exactly what is on screen.
    if (dirty) await projectsApi.saveModel(project.id, model);
    const updated = await projectsApi.edit(project.id, instruction);
    if (updated.model) setModel(updated.model);
    setDirty(false);
    setSelectedId(null);
    onSaved(updated);
  }

  const hint =
    tool === "select"
      ? editorContent.hints.select
      : tool === "wall"
        ? wallStart
          ? editorContent.hints.wallSecond
          : editorContent.hints.wall
        : tool === "door"
          ? editorContent.hints.door
          : editorContent.hints.feature;

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-3">
        <EditorToolbar onToolChange={chooseTool} tool={tool} />
        <p className="text-sm text-muted-foreground">{hint}</p>
        <EditorCanvas
          imageSrc={project.hasImage ? imageUrl(project.id) : null}
          model={model}
          onDragPoint={(handle, point) => change(movePoint(model, handle, point))}
          onPlanClick={handlePlanClick}
          onSelect={setSelectedId}
          selectedId={selectedId}
          tool={tool}
          wallStart={wallStart}
        />
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">{editorContent.aiModel}</span>
            <span className="font-mono break-all">{project.aiModel ??
                (project.hasImage ? editorContent.aiModelNotRecorded : editorContent.noAiModel)}</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-2">
            <Button disabled={!dirty || saving} onClick={save}>
              {saving ? editorContent.saving : editorContent.save}
            </Button>
            <p className="text-sm text-muted-foreground">
              {dirty ? editorContent.unsaved : editorContent.saved}
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between gap-2 text-sm">
            <span className={reviewIds.length ? "text-amber-600" : "text-muted-foreground"}>
              {editorContent.reviewCount(reviewIds.length)}
            </span>
            {reviewIds.length > 0 && (
              <Button
                onClick={() => {
                  chooseTool("select");
                  const next = reviewIds[(reviewIds.indexOf(selectedId ?? "") + 1) % reviewIds.length];
                  setSelectedId(next ?? null);
                }}
                size="sm"
                variant="outline"
              >
                {editorContent.nextReview}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <ElementPanel
              onDelete={deleteSelected}
              onDoorWidthChange={(width) =>
                selectedId && change(updateElement(model, selectedId, (element) => ({ ...element, width })))
              }
              onLabelChange={(label) =>
                selectedId &&
                change(updateElement(model, selectedId, (element) => ({ ...element, label: label || null })))
              }
              onMarkChecked={() =>
                selectedId &&
                change(updateElement(model, selectedId, (element) => ({ ...element, confidence: 1 })))
              }
              selected={selected}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <AiEditBox onSubmit={aiEdit} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
