"use client";

import type { TactileSummary } from "@capstone/shared";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { previewContent } from "@/data/content";
import { projectsApi, stlUrl } from "@/lib/api";

type ExportPanelProps = {
  projectId: string;
  revision: string;
};

// Checks, legend and download buttons for the generated plate.
export function ExportPanel({ projectId, revision }: ExportPanelProps) {
  const [summary, setSummary] = useState<TactileSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    projectsApi
      .tactile(projectId)
      .then(setSummary)
      .catch((caught: Error) => setError(caught.message));
  }, [projectId, revision]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!summary) return null;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-2">
          <Button asChild>
            <a href={stlUrl(projectId, "map", true)}>{previewContent.downloadMap}</a>
          </Button>
          {summary.legend.length > 0 && (
            <Button asChild variant="outline">
              <a href={stlUrl(projectId, "legend", true)}>{previewContent.downloadLegend}</a>
            </Button>
          )}
          <p className="text-sm text-muted-foreground">{previewContent.printTip}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{previewContent.warningsTitle}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {summary.warnings.length === 0 ? (
            <p className="text-muted-foreground">{previewContent.noWarnings}</p>
          ) : (
            <ul className="flex list-disc flex-col gap-1 pl-4 text-amber-700">
              {summary.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{previewContent.legendTitle}</CardTitle>
          <CardDescription>{previewContent.legendDescription}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          {summary.legend.length === 0 ? (
            <p className="text-muted-foreground">{previewContent.noLegend}</p>
          ) : (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              {summary.legend.map((entry) => (
                <div className="contents" key={entry.key}>
                  <dt className="font-mono">{entry.key}</dt>
                  <dd>{entry.text}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{previewContent.symbolsTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex list-disc flex-col gap-1 pl-4 text-sm">
            {previewContent.symbols.map((symbol) => (
              <li key={symbol}>{symbol}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
