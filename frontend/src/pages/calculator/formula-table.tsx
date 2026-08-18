import { cn } from "@nutriai/shared/lib/cn";

/** Small comparison table for calculators that show multiple formula variants
 * (ideal weight, one-rep max, lean body mass). */
export function FormulaTable({ rows }: { rows: { label: string; value: string; highlight?: boolean }[] }) {
  return (
    <div className="mt-5 overflow-hidden rounded-[14px] border border-line">
      {rows.map((r, i) => (
        <div key={i} className={cn("flex items-center justify-between gap-3 px-4 py-3", i > 0 && "border-t border-line", r.highlight && "bg-accT")}>
          <span className="text-[13px] text-tx2">{r.label}</span>
          <span className="font-mono text-[14px] font-medium [font-variant-numeric:tabular-nums]">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
