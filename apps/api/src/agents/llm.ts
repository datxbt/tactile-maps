// One function to call a multimodal model: send instructions, text and an
// optional image, get text back. Supports Google Gemini (default) and
// OpenRouter, selected with MODEL_PROVIDER in apps/api/.env.

export type ImageInput = { data: Uint8Array; mimeType: string }

type AskOptions = {
  agent: string
  // Model ID to call (provider-specific, e.g. google/gemini-3.7-flash).
  model: string
  instruction: string
  text: string
  image?: ImageInput
}

export const provider = process.env.MODEL_PROVIDER ?? 'gemini'
// Used when no model is chosen (MODEL in .env, or the provider's default).
export const defaultModel =
  process.env.MODEL ??
  (provider === 'openrouter' ? 'google/gemini-3.7-flash' : 'gemini-3.7-flash')

let callCount = 0

// Busy (503) and rate-limit (429) errors are common on free tiers and
// usually pass within seconds, so retry those a few times before giving up.
class ModelError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}
const RETRY_DELAYS_MS = [5_000, 15_000, 30_000]

export async function askModel(options: AskOptions): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    callCount += 1
    console.log(`[llm] call #${callCount}: ${options.agent} (${provider} ${options.model})`)
    try {
      return await (provider === 'openrouter' ? askOpenRouter(options) : askGemini(options))
    } catch (error) {
      const retryable = error instanceof ModelError && [429, 500, 503].includes(error.status)
      const delay = RETRY_DELAYS_MS[attempt]
      if (!retryable || delay === undefined) throw error
      console.log(`[llm] ${error.message}; retrying in ${delay / 1000}s`)
      await Bun.sleep(delay)
    }
  }
}

async function askGemini(options: AskOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Chưa đặt GEMINI_API_KEY trong apps/api/.env')

  const parts: object[] = [{ text: options.text }]
  if (options.image) {
    parts.unshift({
      inline_data: {
        data: Buffer.from(options.image.data).toString('base64'),
        mime_type: options.image.mimeType,
      },
    })
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${options.model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: options.instruction }] },
        contents: [{ role: 'user', parts }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
      }),
      signal: AbortSignal.timeout(5 * 60_000),
    },
  )
  const result = (await response.json().catch(() => ({}))) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
    error?: { message?: string }
  }
  if (!response.ok) {
    throw new ModelError(`Lỗi Gemini ${response.status}: ${result.error?.message ?? response.statusText}`, response.status)
  }
  const text = result.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('')
  if (!text) throw new Error('Mô hình không trả về kết quả')
  return text
}

async function askOpenRouter(options: AskOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('Chưa đặt OPENROUTER_API_KEY trong apps/api/.env')

  const content: object[] = [{ type: 'text', text: options.text }]
  if (options.image) {
    const base64 = Buffer.from(options.image.data).toString('base64')
    content.unshift({
      type: 'image_url',
      image_url: { url: `data:${options.image.mimeType};base64,${base64}` },
    })
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options.model,
      // Without a cap OpenRouter reserves the model's whole output budget.
      max_tokens: 32_768,
      temperature: 0.1,
      messages: [
        { role: 'system', content: options.instruction },
        { role: 'user', content },
      ],
    }),
    signal: AbortSignal.timeout(5 * 60_000),
  })
  const result = (await response.json().catch(() => ({}))) as {
    choices?: { message?: { content?: string } }[]
    error?: { message?: string }
  }
  if (!response.ok) {
    throw new ModelError(`Lỗi OpenRouter ${response.status}: ${result.error?.message ?? response.statusText}`, response.status)
  }
  const text = result.choices?.[0]?.message?.content
  if (!text) throw new Error('Mô hình không trả về kết quả')
  return text
}

// Models sometimes wrap JSON in prose or markdown fences: keep the outer object.
export function extractJson(text: string): unknown {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) throw new Error('Mô hình không trả về JSON')
  return JSON.parse(text.slice(start, end + 1))
}
