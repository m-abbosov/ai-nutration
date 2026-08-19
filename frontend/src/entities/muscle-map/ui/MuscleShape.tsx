import type { MuscleCode } from "@nutriai/shared/api/types";

export type ShapeGeometry =
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { kind: "rect"; x: number; y: number; width: number; height: number; rx: number }
  | { kind: "path"; d: string };

export interface MuscleRegionDef {
  muscle: MuscleCode;
  side?: "left" | "right";
  geometry: ShapeGeometry;
}

export interface BodyViewProps {
  getColor: (muscle: MuscleCode) => string;
  getLabel: (muscle: MuscleCode) => string;
  onMuscleEnter: (muscle: MuscleCode, e: React.MouseEvent | React.FocusEvent) => void;
  onMuscleLeave: () => void;
  onMuscleClick: (muscle: MuscleCode) => void;
}

interface MuscleShapeProps extends MuscleRegionDef {
  color: string;
  label: string;
  onEnter: (muscle: MuscleCode, e: React.MouseEvent | React.FocusEvent) => void;
  onLeave: () => void;
  onClick: (muscle: MuscleCode) => void;
}

/** One interactive, semantically-tagged (`data-muscle`/`data-side`) region of
 * the body map — the layer that gets colored by progress score and driven by
 * hover/click. Never reaches into path order or index-based lookups; the
 * `data-muscle` attribute is always the source of truth for what a shape is. */
export function MuscleShape({ muscle, side, geometry, color, label, onEnter, onLeave, onClick }: MuscleShapeProps) {
  const common = {
    "data-muscle": muscle,
    ...(side ? { "data-side": side } : {}),
    fill: color,
    className: "cursor-pointer outline-none transition-[fill,opacity] duration-300 hover:opacity-80 focus-visible:opacity-80",
    tabIndex: 0,
    role: "button",
    "aria-label": label,
    onMouseEnter: (e: React.MouseEvent) => onEnter(muscle, e),
    onMouseLeave: () => onLeave(),
    onFocus: (e: React.FocusEvent) => onEnter(muscle, e),
    onBlur: () => onLeave(),
    onClick: () => onClick(muscle),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick(muscle);
      }
    },
  } as const;

  if (geometry.kind === "ellipse") {
    return <ellipse cx={geometry.cx} cy={geometry.cy} rx={geometry.rx} ry={geometry.ry} {...common} />;
  }
  if (geometry.kind === "rect") {
    return <rect x={geometry.x} y={geometry.y} width={geometry.width} height={geometry.height} rx={geometry.rx} {...common} />;
  }
  return <path d={geometry.d} {...common} />;
}
