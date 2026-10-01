import {
  REVIEW_THRESHOLD,
  type Door,
  type Feature,
  type FeatureKind,
  type FloorModel,
  type Point,
  type Room,
  type Wall,
} from "@capstone/shared";

// Small pure functions the editor uses to change a FloorModel. Each returns
// a new model and never mutates the old one (React needs new objects).

export type ElementKind = "wall" | "door" | "room" | "feature";
export type Tool = "select" | "wall" | "door" | FeatureKind;

// A draggable point: wall end a/b, door or feature "at", or room vertex i.
export type Handle = { id: string; point: "a" | "b" | "at" | number };

export type FoundElement =
  | { kind: "wall"; element: Wall }
  | { kind: "door"; element: Door }
  | { kind: "room"; element: Room }
  | { kind: "feature"; element: Feature };

export function findElement(model: FloorModel, id: string): FoundElement | null {
  const wall = model.walls.find((item) => item.id === id);
  if (wall) return { kind: "wall", element: wall };
  const door = model.doors.find((item) => item.id === id);
  if (door) return { kind: "door", element: door };
  const room = model.rooms.find((item) => item.id === id);
  if (room) return { kind: "room", element: room };
  const feature = model.features.find((item) => item.id === id);
  if (feature) return { kind: "feature", element: feature };
  return null;
}

// Apply a change to whichever element has this id.
export function updateElement(
  model: FloorModel,
  id: string,
  change: <T extends Wall | Door | Room | Feature>(element: T) => T
): FloorModel {
  const apply = <T extends { id: string }>(items: T[]) =>
    items.map((item) => (item.id === id ? change(item as never) : item)) as T[];
  return {
    ...model,
    walls: apply(model.walls),
    doors: apply(model.doors),
    rooms: apply(model.rooms),
    features: apply(model.features),
  };
}

export function movePoint(model: FloorModel, handle: Handle, to: Point): FloorModel {
  const point = { x: Math.round(to.x), y: Math.round(to.y) };
  return updateElement(model, handle.id, (element) => {
    if (typeof handle.point === "number" && "polygon" in element) {
      const polygon = element.polygon.map((p, i) => (i === handle.point ? point : p));
      return { ...element, polygon };
    }
    return { ...element, [handle.point]: point };
  });
}

export function removeElement(model: FloorModel, id: string): FloorModel {
  const keep = <T extends { id: string }>(items: T[]) => items.filter((item) => item.id !== id);
  return {
    ...model,
    walls: keep(model.walls),
    doors: keep(model.doors),
    rooms: keep(model.rooms),
    features: keep(model.features),
  };
}

export function newId(model: FloorModel, prefix: string): string {
  const ids = new Set(
    [...model.walls, ...model.doors, ...model.rooms, ...model.features].map((item) => item.id)
  );
  let n = 1;
  while (ids.has(`${prefix}-${n}`)) n++;
  return `${prefix}-${n}`;
}

export function idsNeedingReview(model: FloorModel): string[] {
  return [...model.walls, ...model.doors, ...model.rooms, ...model.features]
    .filter((item) => item.confidence < REVIEW_THRESHOLD)
    .map((item) => item.id);
}
