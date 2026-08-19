import type { BodyViewProps, MuscleRegionDef } from "./MuscleShape";
import { MuscleShape } from "./MuscleShape";

const FRONT_REGIONS: MuscleRegionDef[] = [
  { muscle: "UPPER_CHEST", side: "left", geometry: { kind: "ellipse", cx: 112, cy: 98, rx: 26, ry: 14 } },
  { muscle: "UPPER_CHEST", side: "right", geometry: { kind: "ellipse", cx: 188, cy: 98, rx: 26, ry: 14 } },
  { muscle: "CHEST", side: "left", geometry: { kind: "ellipse", cx: 112, cy: 125, rx: 30, ry: 20 } },
  { muscle: "CHEST", side: "right", geometry: { kind: "ellipse", cx: 188, cy: 125, rx: 30, ry: 20 } },
  { muscle: "SHOULDERS", side: "left", geometry: { kind: "ellipse", cx: 68, cy: 100, rx: 24, ry: 26 } },
  { muscle: "SHOULDERS", side: "right", geometry: { kind: "ellipse", cx: 232, cy: 100, rx: 24, ry: 26 } },
  { muscle: "FRONT_DELTS", side: "left", geometry: { kind: "ellipse", cx: 72, cy: 95, rx: 14, ry: 16 } },
  { muscle: "FRONT_DELTS", side: "right", geometry: { kind: "ellipse", cx: 228, cy: 95, rx: 14, ry: 16 } },
  { muscle: "SIDE_DELTS", side: "left", geometry: { kind: "ellipse", cx: 58, cy: 102, rx: 12, ry: 16 } },
  { muscle: "SIDE_DELTS", side: "right", geometry: { kind: "ellipse", cx: 242, cy: 102, rx: 12, ry: 16 } },
  { muscle: "BICEPS", side: "left", geometry: { kind: "ellipse", cx: 61, cy: 140, rx: 16, ry: 30 } },
  { muscle: "BICEPS", side: "right", geometry: { kind: "ellipse", cx: 239, cy: 140, rx: 16, ry: 30 } },
  { muscle: "FOREARMS", side: "left", geometry: { kind: "ellipse", cx: 53, cy: 225, rx: 15, ry: 38 } },
  { muscle: "FOREARMS", side: "right", geometry: { kind: "ellipse", cx: 247, cy: 225, rx: 15, ry: 38 } },
  { muscle: "ABS", geometry: { kind: "rect", x: 128, y: 145, width: 44, height: 75, rx: 14 } },
  { muscle: "OBLIQUES", side: "left", geometry: { kind: "ellipse", cx: 118, cy: 180, rx: 12, ry: 40 } },
  { muscle: "OBLIQUES", side: "right", geometry: { kind: "ellipse", cx: 182, cy: 180, rx: 12, ry: 40 } },
  { muscle: "QUADS", side: "left", geometry: { kind: "ellipse", cx: 121, cy: 340, rx: 24, ry: 60 } },
  { muscle: "QUADS", side: "right", geometry: { kind: "ellipse", cx: 179, cy: 340, rx: 24, ry: 60 } },
  { muscle: "CALVES", side: "left", geometry: { kind: "ellipse", cx: 121, cy: 465, rx: 19, ry: 45 } },
  { muscle: "CALVES", side: "right", geometry: { kind: "ellipse", cx: 179, cy: 465, rx: 19, ry: 45 } },
];

export function FrontBody({ getColor, getLabel, onMuscleEnter, onMuscleLeave, onMuscleClick }: BodyViewProps) {
  return (
    <svg viewBox="0 0 300 600" className="h-full w-full max-w-[300px]" role="img" aria-label="Front body muscle map">
      {/* Non-interactive base silhouette — never colored by progress data,
          just the anatomical frame the muscle regions sit on top of. */}
      <g fill="var(--surf2)" stroke="var(--line)" strokeWidth={1}>
        <ellipse cx={150} cy={38} rx={26} ry={30} />
        <rect x={138} y={64} width={24} height={20} />
        <path d="M85,88 C70,95 62,140 68,200 L95,215 L95,230 L205,230 L205,215 L232,200 C238,140 230,95 215,88 C190,78 110,78 85,88 Z" />
        <rect x={40} y={95} width={42} height={95} rx={20} />
        <rect x={218} y={95} width={42} height={95} rx={20} />
        <rect x={35} y={185} width={36} height={90} rx={16} />
        <rect x={229} y={185} width={36} height={90} rx={16} />
        <ellipse cx={48} cy={285} rx={14} ry={18} />
        <ellipse cx={252} cy={285} rx={14} ry={18} />
        <path d="M95,230 L205,230 L215,270 L85,270 Z" />
        <rect x={95} y={270} width={52} height={140} rx={22} />
        <rect x={153} y={270} width={52} height={140} rx={22} />
        <rect x={100} y={410} width={42} height={110} rx={18} />
        <rect x={158} y={410} width={42} height={110} rx={18} />
        <rect x={92} y={515} width={50} height={20} rx={10} />
        <rect x={158} y={515} width={50} height={20} rx={10} />
      </g>

      {FRONT_REGIONS.map((region, i) => (
        <MuscleShape
          key={`${region.muscle}-${region.side ?? "c"}-${i}`}
          {...region}
          color={getColor(region.muscle)}
          label={getLabel(region.muscle)}
          onEnter={onMuscleEnter}
          onLeave={onMuscleLeave}
          onClick={onMuscleClick}
        />
      ))}
    </svg>
  );
}
