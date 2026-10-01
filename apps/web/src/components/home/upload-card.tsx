"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ModelSelect } from "@/components/home/model-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { homeContent } from "@/data/content";
import { projectsApi } from "@/lib/api";

export function UploadCard() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<{ id: string }>) {
    setBusy(true);
    setError(null);
    try {
      const project = await action();
      router.push(`/projects/${project.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setBusy(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    run(() => projectsApi.upload(form));
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{homeContent.uploadTitle}</CardTitle>
        <CardDescription>{homeContent.uploadDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="file">{homeContent.fileLabel}</Label>
            <Input accept="image/png,image/jpeg,image/webp" id="file" name="file" required type="file" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{homeContent.nameLabel}</Label>
            <Input id="name" name="name" placeholder={homeContent.namePlaceholder} />
          </div>
          <ModelSelect />
          <Button disabled={busy} type="submit">
            {busy ? homeContent.uploading : homeContent.upload}
          </Button>
        </form>
        <Button disabled={busy} onClick={() => run(projectsApi.createSample)} variant="outline">
          {homeContent.sample}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
