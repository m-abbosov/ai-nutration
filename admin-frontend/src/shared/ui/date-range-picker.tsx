import { cn } from "@nutriai/shared/lib/cn";

import { useAdminTranslation } from "@/shared/i18n/use-admin-translation";
import { AdminInput } from "@/shared/ui/input";

export interface RangeOption<T extends string> {
  value: T;
  label: string;
}

export function DateRangePicker<T extends string>({
  value,
  options,
  onChange,
  customFrom,
  customTo,
  onCustomChange,
}: {
  value: T;
  options: RangeOption<T>[];
  onChange: (value: T) => void;
  customFrom?: string;
  customTo?: string;
  onCustomChange?: (from: string, to: string) => void;
}) {
  const { t } = useAdminTranslation();
  const isCustom = value === "custom";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="flex items-center gap-0.5 rounded-[var(--adm-radius-md)] border p-0.5"
        style={{ background: "var(--adm-bg-inset)", borderColor: "var(--adm-border)" }}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn("rounded-[var(--adm-radius-sm)] px-2.5 py-1 text-[12px] font-medium transition-colors")}
              style={{
                background: active ? "var(--adm-surface)" : "transparent",
                color: active ? "var(--adm-text)" : "var(--adm-text-3)",
                boxShadow: active ? "var(--adm-shadow-sm)" : "none",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {isCustom && onCustomChange && (
        <div className="flex items-center gap-1.5">
          <AdminInput
            type="date"
            value={customFrom ?? ""}
            aria-label={t.ranges.from}
            onChange={(e) => onCustomChange(e.target.value, customTo ?? "")}
            className="w-[136px]"
          />
          <span style={{ color: "var(--adm-text-3)" }}>–</span>
          <AdminInput
            type="date"
            value={customTo ?? ""}
            aria-label={t.ranges.to}
            onChange={(e) => onCustomChange(customFrom ?? "", e.target.value)}
            className="w-[136px]"
          />
        </div>
      )}
    </div>
  );
}
