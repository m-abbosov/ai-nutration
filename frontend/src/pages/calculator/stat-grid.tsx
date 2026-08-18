/** Mini stat-cell row, ported from the removed landing-page BMI demo (docs/design-reference/landing.html:407-411). */
export function StatGrid({ cells }: { cells: { label: string; value: string }[] }) {
  return (
    <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-px overflow-hidden rounded-[14px] bg-line">
      {cells.map((c, i) => (
        <div key={i} className="bg-surf px-3.5 py-3.5">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[8.5px] tracking-[.13em] text-tx3">{c.label}</div>
          <div className="mt-1.5 text-[15px] font-medium [font-variant-numeric:tabular-nums]">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
