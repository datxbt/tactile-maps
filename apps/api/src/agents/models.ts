import type { ModelChoice, ModelOptions } from '@capstone/shared'
import { defaultModel, provider } from './llm'

// The only models the webpage may choose (OpenRouter IDs). Keeping the list
// on the server means nobody can run an expensive model by editing the page.
// approxCents is the cost per floor plan: measured on OpenRouter where noted
// (one run each, 2026-09-29), otherwise a rough estimate.
const OPENROUTER_CHOICES: ModelChoice[] = [
  { id: 'google/gemini-3.7-flash', label: 'Gemini 3.7 Flash', approxCents: 10 }, // measured
  { id: 'google/gemini-3.8-flash', label: 'Gemini 3.8 Flash', approxCents: 10 }, // same token price as 3.7 Flash
  { id: 'google/gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite', approxCents: 0.5 }, // measured (<1¢)
  { id: 'qwen/qwen3-vl-235b-a22b-instruct', label: 'Qwen3 VL 235B', approxCents: 3 },
  { id: 'anthropic/claude-sonnet-5.5', label: 'Claude Sonnet 5.5', approxCents: 2 }, // measured; best results so far
  { id: 'google/gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro', approxCents: 27 }, // measured
  { id: 'anthropic/claude-opus-5.5', label: 'Claude Opus 5.5', approxCents: 31 },
]

export function modelOptions(): ModelOptions {
  // The direct Gemini API only takes Google model names, so offer just the
  // configured model there. The dropdown needs MODEL_PROVIDER=openrouter.
  if (provider !== 'openrouter') {
    return { defaultModel, choices: [{ id: defaultModel, label: defaultModel, approxCents: null }] }
  }
  const choices = OPENROUTER_CHOICES.some((choice) => choice.id === defaultModel)
    ? OPENROUTER_CHOICES
    : [{ id: defaultModel, label: `${defaultModel} (from .env)`, approxCents: null }, ...OPENROUTER_CHOICES]
  return { defaultModel, choices }
}

export function isAllowedModel(id: string): boolean {
  return modelOptions().choices.some((choice) => choice.id === id)
}
