import type { FloorModel } from '@capstone/shared'

// A hand-written small office (1000 x 800 px): corridor across the middle,
// four rooms, entrance at the bottom. Lets you try the whole flow without
// an AI key. A few elements have low confidence so the review flags show.
export const sampleFloorModel: FloorModel = {
  title: 'Sample office',
  widthPx: 1000,
  heightPx: 800,
  walls: [
    { id: 'w-top', a: { x: 40, y: 40 }, b: { x: 960, y: 40 }, confidence: 0.98 },
    { id: 'w-right', a: { x: 960, y: 40 }, b: { x: 960, y: 760 }, confidence: 0.98 },
    { id: 'w-bottom', a: { x: 960, y: 760 }, b: { x: 40, y: 760 }, confidence: 0.98 },
    { id: 'w-left', a: { x: 40, y: 760 }, b: { x: 40, y: 40 }, confidence: 0.98 },
    { id: 'w-corridor-n', a: { x: 40, y: 380 }, b: { x: 960, y: 380 }, confidence: 0.9 },
    { id: 'w-corridor-s', a: { x: 40, y: 480 }, b: { x: 960, y: 480 }, confidence: 0.9 },
    { id: 'w-div-top', a: { x: 500, y: 40 }, b: { x: 500, y: 380 }, confidence: 0.85 },
    { id: 'w-div-bottom', a: { x: 500, y: 480 }, b: { x: 500, y: 760 }, confidence: 0.62 },
  ],
  doors: [
    { id: 'd-nw', at: { x: 250, y: 380 }, width: 45, confidence: 0.9 },
    { id: 'd-ne', at: { x: 730, y: 380 }, width: 45, confidence: 0.88 },
    { id: 'd-sw', at: { x: 250, y: 480 }, width: 45, confidence: 0.55 },
    { id: 'd-se', at: { x: 730, y: 480 }, width: 45, confidence: 0.92 },
    { id: 'd-entry', at: { x: 730, y: 760 }, width: 60, confidence: 0.95 },
  ],
  rooms: [
    { id: 'r-nw', polygon: [{ x: 40, y: 40 }, { x: 500, y: 40 }, { x: 500, y: 380 }, { x: 40, y: 380 }], label: 'Studio', confidence: 0.9 },
    { id: 'r-ne', polygon: [{ x: 500, y: 40 }, { x: 960, y: 40 }, { x: 960, y: 380 }, { x: 500, y: 380 }], label: 'Lab', confidence: 0.86 },
    { id: 'r-corridor', polygon: [{ x: 40, y: 380 }, { x: 960, y: 380 }, { x: 960, y: 480 }, { x: 40, y: 480 }], label: 'Corridor', confidence: 0.95 },
    { id: 'r-sw', polygon: [{ x: 40, y: 480 }, { x: 500, y: 480 }, { x: 500, y: 760 }, { x: 40, y: 760 }], label: 'Workshop', confidence: 0.58 },
    { id: 'r-se', polygon: [{ x: 500, y: 480 }, { x: 960, y: 480 }, { x: 960, y: 760 }, { x: 500, y: 760 }], label: 'Lobby', confidence: 0.93 },
  ],
  features: [
    { id: 'f-stairs', kind: 'stairs', at: { x: 110, y: 110 }, confidence: 0.85 },
    { id: 'f-restroom', kind: 'restroom', at: { x: 890, y: 110 }, confidence: 0.8 },
    { id: 'f-entrance', kind: 'entrance', at: { x: 730, y: 710 }, confidence: 0.95 },
    { id: 'f-elevator', kind: 'elevator', at: { x: 110, y: 430 }, confidence: 0.45 },
  ],
}
