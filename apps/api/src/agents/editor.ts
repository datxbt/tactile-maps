import type { FloorModel } from '@capstone/shared'
import { askModel, extractJson, type ImageInput } from './llm'
import { normalizeModel } from './normalize'

// Edit agent: applies a plain-English instruction ("add a door between the
// lobby and the corridor", "rename r-2 to Kitchen") to the current model.
const EDITOR_INSTRUCTION = `You edit a floor model that describes a building floor plan for a tactile map. You receive the current model as JSON (and the floor plan image when available) plus one instruction from the user.

Apply ONLY what the instruction asks. Keep every other element exactly as it is, including coordinates, labels and confidence.
- Coordinates are pixels in the plan image: origin top-left, x right, y down.
- walls have endpoints "a" and "b"; doors have a center "at" and a "width"; rooms have a "polygon" and a "label"; features have a "kind" (stairs, elevator, entrance, restroom) and an "at" point.
- Elements you add or change at the user's request get confidence 1.

Respond with ONLY the complete updated model as JSON, in the same shape you received (points may be {"x": .., "y": ..} objects).`

export async function editFloorModel(
  model: FloorModel,
  instruction: string,
  aiModel: string,
  image?: ImageInput,
): Promise<FloorModel> {
  const { widthPx, heightPx, ...content } = model
  const text = await askModel({
    agent: 'editor',
    model: aiModel,
    instruction: EDITOR_INSTRUCTION,
    text: `Image size: ${widthPx} x ${heightPx} pixels.\n\nCurrent model:\n${JSON.stringify(content)}\n\nInstruction: ${instruction}`,
    image,
  })
  return normalizeModel(extractJson(text), widthPx, heightPx)
}
