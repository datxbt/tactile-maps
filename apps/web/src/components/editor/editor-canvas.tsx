"use client";

import { REVIEW_THRESHOLD, type FloorModel, type Point } from "@capstone/shared";
import { useRef, useState, type PointerEvent } from "react";
import { editorContent } from "@/data/content";
import type { Handle, Tool } from "@/lib/floor-edit";

const COLORS = {
  wall: "#1c1917",
  door: "#ea580c",
  room: "#2563eb",
  feature: "#7c3aed",
  review: "#f59e0b",
  selected: "#2563eb",
};

type EditorCanvasProps = {
  model: FloorModel;
  imageSrc: string | null;
  tool: Tool;
  selectedId: string | null;
  wallStart: Point | null;
  onSelect: (id: string | null) => void;
  onPlanClick: (point: Point) => void;
  onDragPoint: (handle: Handle, point: Point) => void;
};

// Draws the floor model as SVG on top of the uploaded plan image. The SVG
// uses plan pixels as its coordinate system, so no conversion is needed
// except from mouse position to SVG coordinates.
export function EditorCanvas({
  model,
  imageSrc,
  tool,
  selectedId,
  wallStart,
  onSelect,
  onPlanClick,
  onDragPoint,
}: EditorCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<Handle | null>(null);
  const [hover, setHover] = useState<Point | null>(null);
  // Line widths and handle sizes scale with the plan so they look the same.
  const unit = Math.max(model.widthPx, model.heightPx) / 200;

  function toPlan(event: PointerEvent): Point {
    const svg = svgRef.current!;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const { x, y } = point.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x, y };
  }

  function selectOnClick(id: string) {
    return (event: PointerEvent) => {
      if (tool !== "select") return;
      event.stopPropagation();
      onSelect(id);
    };
  }

  function startDrag(handle: Handle) {
    return (event: PointerEvent) => {
      event.stopPropagation();
      svgRef.current?.setPointerCapture(event.pointerId);
      setDragging(handle);
    };
  }

  const reviewStroke = (confidence: number, id: string) =>
    id === selectedId ? COLORS.selected : confidence < REVIEW_THRESHOLD ? COLORS.review : undefined;

  const selectedHandles = handlesFor(model, selectedId);

  return (
    <svg
      className="h-auto w-full touch-none rounded-lg border bg-white"
      onPointerDown={(event) => (tool === "select" ? onSelect(null) : onPlanClick(toPlan(event)))}
      onPointerMove={(event) => {
        const point = toPlan(event);
        setHover(point);
        if (dragging) onDragPoint(dragging, point);
      }}
      onPointerUp={() => setDragging(null)}
      ref={svgRef}
      style={{ cursor: tool === "select" ? "default" : "crosshair" }}
      viewBox={`0 0 ${model.widthPx} ${model.heightPx}`}
    >
      {imageSrc && (
        <image height={model.heightPx} href={imageSrc} opacity={0.45} width={model.widthPx} />
      )}

      {model.rooms.map((room) => {
        const center = average(room.polygon);
        return (
          <g key={room.id} onPointerDown={selectOnClick(room.id)}>
            <polygon
              fill={COLORS.room}
              fillOpacity={room.id === selectedId ? 0.18 : 0.06}
              points={room.polygon.map((p) => `${p.x},${p.y}`).join(" ")}
              stroke={reviewStroke(room.confidence, room.id) ?? "none"}
              strokeDasharray={room.id === selectedId ? undefined : `${unit * 2}`}
              strokeWidth={unit * 0.8}
            />
            {room.label && (
              <text
                fill={COLORS.room}
                fontSize={unit * 4}
                pointerEvents="none"
                textAnchor="middle"
                x={center.x}
                y={center.y}
              >
                {room.label}
              </text>
            )}
          </g>
        );
      })}

      {model.walls.map((wall) => (
        <line
          key={wall.id}
          onPointerDown={selectOnClick(wall.id)}
          stroke={reviewStroke(wall.confidence, wall.id) ?? COLORS.wall}
          strokeLinecap="round"
          strokeWidth={unit * 1.5}
          x1={wall.a.x}
          x2={wall.b.x}
          y1={wall.a.y}
          y2={wall.b.y}
        />
      ))}

      {model.doors.map((door) => (
        <circle
          cx={door.at.x}
          cy={door.at.y}
          fill={COLORS.door}
          fillOpacity={0.35}
          key={door.id}
          onPointerDown={selectOnClick(door.id)}
          r={door.width / 2}
          stroke={reviewStroke(door.confidence, door.id) ?? COLORS.door}
          strokeWidth={unit * 0.8}
        />
      ))}

      {model.features.map((feature) => (
        <g key={feature.id} onPointerDown={selectOnClick(feature.id)}>
          <circle
            cx={feature.at.x}
            cy={feature.at.y}
            fill="white"
            r={unit * 4}
            stroke={reviewStroke(feature.confidence, feature.id) ?? COLORS.feature}
            strokeWidth={unit * 0.8}
          />
          <text
            dominantBaseline="central"
            fill={COLORS.feature}
            fontSize={unit * 3}
            fontWeight={700}
            pointerEvents="none"
            textAnchor="middle"
            x={feature.at.x}
            y={feature.at.y}
          >
            {editorContent.featureLetters[feature.kind]}
          </text>
        </g>
      ))}

      {wallStart && hover && (
        <line
          pointerEvents="none"
          stroke={COLORS.selected}
          strokeDasharray={`${unit * 2}`}
          strokeWidth={unit * 1.5}
          x1={wallStart.x}
          x2={hover.x}
          y1={wallStart.y}
          y2={hover.y}
        />
      )}

      {selectedHandles.map(({ handle, point }) => (
        <circle
          cx={point.x}
          cy={point.y}
          fill="white"
          key={`${handle.id}-${handle.point}`}
          onPointerDown={startDrag(handle)}
          r={unit * 2}
          stroke={COLORS.selected}
          strokeWidth={unit * 0.8}
          style={{ cursor: "move" }}
        />
      ))}
    </svg>
  );
}

function handlesFor(model: FloorModel, id: string | null): { handle: Handle; point: Point }[] {
  if (!id) return [];
  const wall = model.walls.find((item) => item.id === id);
  if (wall) {
    return [
      { handle: { id, point: "a" }, point: wall.a },
      { handle: { id, point: "b" }, point: wall.b },
    ];
  }
  const room = model.rooms.find((item) => item.id === id);
  if (room) return room.polygon.map((point, i) => ({ handle: { id, point: i }, point }));
  const other = [...model.doors, ...model.features].find((item) => item.id === id);
  return other ? [{ handle: { id, point: "at" }, point: other.at }] : [];
}

function average(points: Point[]): Point {
  return {
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
  };
}
