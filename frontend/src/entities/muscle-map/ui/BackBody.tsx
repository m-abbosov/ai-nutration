import type { BodyViewProps, MuscleRegionDef } from "./MuscleShape";
import { MuscleShape } from "./MuscleShape";

const BACK_REGIONS: MuscleRegionDef[] = [
  { muscle: "TRAPS", geometry: { kind: "path", d: "M150,80 L182,112 L150,162 L118,112 Z" } },
  { muscle: "SHOULDERS", side: "left", geometry: { kind: "ellipse", cx: 68, cy: 100, rx: 24, ry: 26 } },
  { muscle: "SHOULDERS", side: "right", geometry: { kind: "ellipse", cx: 232, cy: 100, rx: 24, ry: 26 } },
  { muscle: "REAR_DELTS", side: "left", geometry: { kind: "ellipse", cx: 72, cy: 98, rx: 14, ry: 16 } },
  { muscle: "REAR_DELTS", side: "right", geometry: { kind: "ellipse", cx: 228, cy: 98, rx: 14, ry: 16 } },
  { muscle: "SIDE_DELTS", side: "left", geometry: { kind: "ellipse", cx: 58, cy: 102, rx: 12, ry: 16 } },
  { muscle: "SIDE_DELTS", side: "right", geometry: { kind: "ellipse", cx: 242, cy: 102, rx: 12, ry: 16 } },
  { muscle: "TRICEPS", side: "left", geometry: { kind: "ellipse", cx: 61, cy: 140, rx: 16, ry: 30 } },
  { muscle: "TRICEPS", side: "right", geometry: { kind: "ellipse", cx: 239, cy: 140, rx: 16, ry: 30 } },
  { muscle: "FOREARMS", side: "left", geometry: { kind: "ellipse", cx: 53, cy: 225, rx: 15, ry: 38 } },
  { muscle: "FOREARMS", side: "right", geometry: { kind: "ellipse", cx: 247, cy: 225, rx: 15, ry: 38 } },
  { muscle: "LATS", side: "left", geometry: { kind: "ellipse", cx: 100, cy: 175, rx: 24, ry: 52 } },
  { muscle: "LATS", side: "right", geometry: { kind: "ellipse", cx: 200, cy: 175, rx: 24, ry: 52 } },
  { muscle: "BACK", geometry: { kind: "rect", x: 128, y: 150, width: 44, height: 65, rx: 14 } },
  { muscle: "GLUTES", side: "left", geometry: { kind: "ellipse", cx: 121, cy: 280, rx: 26, ry: 28 } },
  { muscle: "GLUTES", side: "right", geometry: { kind: "ellipse", cx: 179, cy: 280, rx: 26, ry: 28 } },
  { muscle: "HAMSTRINGS", side: "left", geometry: { kind: "ellipse", cx: 121, cy: 350, rx: 22, ry: 55 } },
  { muscle: "HAMSTRINGS", side: "right", geometry: { kind: "ellipse", cx: 179, cy: 350, rx: 22, ry: 55 } },
  { muscle: "CALVES", side: "left", geometry: { kind: "ellipse", cx: 121, cy: 465, rx: 19, ry: 45 } },
  { muscle: "CALVES", side: "right", geometry: { kind: "ellipse", cx: 179, cy: 465, rx: 19, ry: 45 } },
];

export function BackBody({ getColor, getLabel, onMuscleEnter, onMuscleLeave, onMuscleClick }: BodyViewProps) {
  return (
    <svg viewBox="0 0 300 600" className="h-full w-full max-w-[300px]" role="img" aria-label="Back body muscle map">
      {/* Same non-interactive base silhouette as FrontBody.tsx — a separate
          document since front/back geometry mirrors but never overlaps. */}
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

      {BACK_REGIONS.map((region, i) => (
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
