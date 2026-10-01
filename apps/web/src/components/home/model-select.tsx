"use client";

import type { ModelOptions } from "@capstone/shared";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { homeContent } from "@/data/content";
import { modelsApi } from "@/lib/api";

// Dropdown of the AI models the backend allows, with a rough price per run.
// It is a plain <select name="model">, so the upload form sends it as-is.
export function ModelSelect() {
  const [options, setOptions] = useState<ModelOptions | null>(null);

  useEffect(() => {
    modelsApi.options().then(setOptions).catch(() => setOptions(null));
  }, []);

  if (!options) return null;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="model">{homeContent.modelLabel}</Label>
      <NativeSelect className="w-full" defaultValue={options.defaultModel} id="model" name="model">
        {options.choices.map((choice) => (
          <NativeSelectOption key={choice.id} value={choice.id}>
            {choice.label}
            {choice.approxCents !== null && ` · ${homeContent.modelPrice(choice.approxCents)}`}
            {choice.id === options.defaultModel && ` (${homeContent.modelDefault})`}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <p className="text-xs text-muted-foreground">{homeContent.modelHint}</p>
    </div>
  );
}
