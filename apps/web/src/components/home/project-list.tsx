"use client";

import type { Project } from "@capstone/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { homeContent, statusLabels } from "@/data/content";
import { projectsApi } from "@/lib/api";

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    projectsApi
      .list()
      .then(setProjects)
      .catch((caught: Error) => setError(caught.message));
  }, []);

  async function handleDelete(id: string) {
    await projectsApi.remove(id);
    setProjects((current) => current.filter((project) => project.id !== id));
  }

  return (
    <section className="flex w-full flex-col gap-3">
      <h2 className="text-lg font-medium">{homeContent.projectsTitle}</h2>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!error && projects.length === 0 && (
        <p className="text-sm text-muted-foreground">{homeContent.noProjects}</p>
      )}
      <ul className="flex flex-col divide-y rounded-lg border">
        {projects.map((project) => (
          <li className="flex items-center gap-3 px-4 py-3" key={project.id}>
            <Link className="flex-1 truncate font-medium hover:underline" href={`/projects/${project.id}`}>
              {project.name}
            </Link>
            <Badge variant={project.status === "failed" ? "destructive" : "secondary"}>
              {statusLabels[project.status]}
            </Badge>
            <Button onClick={() => handleDelete(project.id)} size="sm" variant="ghost">
              {homeContent.delete}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
