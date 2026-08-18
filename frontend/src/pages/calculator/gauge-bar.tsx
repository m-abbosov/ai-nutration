/** Generic N-segment colored gauge with a positioned marker + tick labels + legend.
 * Ported from the removed landing-page BMI demo's gauge (docs/design-reference/landing.html:383-405). */
export function GaugeBar({
  segments,
  markerPct,
  ticks,
  legend,
}: {
  segments: { color: string; widthPct: number }[]
  markerPct: number
  ticks: string[]
  legend: { color: string; label: string }[]
}) {
  return (
    <div className="mt-6">
      <div className="flex h-[9px] gap-[2px] overflow-hidden rounded-full">
        {segments.map((s, i) => (
          <div key={i} style={{ width: `${s.widthPct}%`, background: s.color }} />
        ))}
      </div>
      <div className="relative h-5">
        <div
          className="absolute top-[-3px] transition-[left] duration-700"
          style={{ left: `${markerPct}%`, transform: 'translateX(-50%)' }}
        >
          <div className="mx-auto h-[13px] w-[2px] rounded-sm bg-tx" />
          <div className="-mt-0.5 h-[9px] w-[9px] rounded-full border-2 border-bg2 bg-tx" />
        </div>
      </div>
      <div className="flex justify-between font-mono text-[9px] tracking-[.1em] text-tx3">
        {ticks.map((tick, i) => (
          <span key={i}>{tick}</span>
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-3">
        {legend.map((l, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-[11px] text-tx2">
            <span className="h-[3px] w-2 rounded-full" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  )
}
