"use client";

import type { FloorModel, Project } from "@capstone/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FloorEditor } from "@/components/editor/floor-editor";
import { ExportPanel } from "@/components/preview/export-panel";
import { PlateViewer } from "@/components/preview/plate-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { statusLabels, workspaceContent } from "@/data/content";
import { projectsApi, stlUrl } from "@/lib/api";

type ProjectWorkspaceProps = {
  id: string;
};

// One map, from "the AI is reading it" to "download the STL".
export function ProjectWorkspace({ id }: ProjectWorkspaceProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Changes whenever the model is saved, so the 3D view reloads.
  const [revision, setRevision] = useState(() => String(Date.now()));

  const waiting = !project || project.status === "uploaded" || project.status === "parsing";

  // Load the project, then keep polling while the parser agent works.
  useEffect(() => {
    if (!waiting) return;
    const load = () =>
      projectsApi
        .get(id)
        .then(setProject)
        .catch((caught: Error) => setError(caught.message));
    load();
    const timer = setInterval(load, 2000);
    return () => clearInterval(timer);
  }, [id, waiting]);

  function handleSaved(updated: Project) {
    setProject(updated);
    setRevision(String(Date.now()));
  }

  async function retry() {
    setProject(await projectsApi.parse(id));
  }

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-center gap-3">
        <Link className="text-sm text-muted-foreground hover:text-foreground" href="/maps">
          {workspaceContent.back}
        </Link>
        <h1 className="text-2xl font-semibold">{project?.name}</h1>
        {project && <Badge variant="secondary">{statusLabels[project.status]}</Badge>}
      </header>

      {error && <p className="text-destructive">{error}</p>}

      {project && waiting && (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Spinner className="size-8" />
          <p className="font-medium">{workspaceContent.parsingTitle}</p>
          <p className="text-sm text-muted-foreground">{workspaceContent.parsingDescription}</p>
        </div>
      )}

      {project?.status === "failed" && (
        <div className="flex flex-col items-start gap-3">
          <p className="font-medium">{workspaceContent.failedTitle}</p>
          <p className="text-sm text-destructive">{project.error}</p>
          {project.hasImage && <Button onClick={retry}>{workspaceContent.retry}</Button>}
        </div>
      )}

      {project?.status === "ready" && project.model && (
        <Tabs className="min-w-0" defaultValue="edit">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="edit">{workspaceContent.editTab}</TabsTrigger>
            <TabsTrigger value="preview">{workspaceContent.previewTab}</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <FloorEditor onSaved={handleSaved} project={project as Project & { model: FloorModel }} />
          </TabsContent>
          <TabsContent value="preview">
            <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <PlateViewer src={`${stlUrl(id, "map")}?v=${revision}`} />
              <ExportPanel projectId={id} revision={revision} />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}
