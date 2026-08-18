import { useState } from "react";

import { useTranslation } from "@nutriai/shared/i18n";
import { cn } from "@nutriai/shared/lib/cn";
import { fmtDecimal } from "@nutriai/shared/lib/format";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { RACE_PRESETS_KM, calculatePace, formatMinutesToClock } from "@/entities/calculator/lib/formulas";

import { CalculatorShell, ErrorBanner, ResultHero, ResultPlaceholder } from "./calculator-shell";
import { StatGrid } from "./stat-grid";
import { DistanceField, UnitToggle, useUnitSystem } from "./unit-fields";
import { useLogCalculatorUsage } from "./use-log-usage";

const PRESETS = [
  { key: "fiveK", km: RACE_PRESETS_KM.fiveK },
  { key: "tenK", km: RACE_PRESETS_KM.tenK },
  { key: "halfMarathon", km: RACE_PRESETS_KM.halfMarathon },
  { key: "marathon", km: RACE_PRESETS_KM.marathon },
] as const;

export default function PacePage() {
  const { t, lang } = useTranslation();
  const [unit, setUnit] = useUnitSystem();
  const [distanceKm, setDistanceKm] = useState("5");
  const [minutes, setMinutes] = useState("25");
  const [seconds, setSeconds] = useState("0");

  const d = parseFloat(distanceKm);
  const m = parseFloat(minutes) || 0;
  const s = parseFloat(seconds) || 0;
  const totalMinutes = m + s / 60;
  const ok = d > 0 && totalMinutes > 0;

  const result = ok ? calculatePace(d, totalMinutes) : null;
  useLogCalculatorUsage("pace", { distanceKm: d, minutes: m, seconds: s, unit }, result);

  return (
    <CalculatorShell
      calcId="pace"
      inputs={
        <div>
          <UnitToggle unit={unit} onChange={setUnit} />
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setDistanceKm(String(p.km))}
                className={cn(
                  "rounded-[10px] border px-3 py-1.5 text-[12px] font-medium transition-colors",
                  Math.abs(d - p.km) < 0.001 ? "border-acc bg-accT text-acc" : "border-line text-tx2 hover:border-line2",
                )}
              >
                {t.calcPages.pace.presets[p.key]}
              </button>
            ))}
          </div>
          <div className="mt-3.5 grid grid-cols-2 gap-3.5">
            <div className="col-span-2">
              <DistanceField
                id="distance"
                label={t.calcPages.pace.distanceKm}
                unit={unit}
                distanceKm={distanceKm}
                onDistanceKmChange={setDistanceKm}
              />
            </div>
            <div>
              <Label htmlFor="minutes">{t.calcPages.fields.time} · min</Label>
              <Input id="minutes" type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="seconds">{t.calcPages.fields.time} · sec</Label>
              <Input id="seconds" type="number" value={seconds} onChange={(e) => setSeconds(e.target.value)} />
            </div>
          </div>
          {!ok && <ErrorBanner message={t.calcPages.invalidInput} />}
        </div>
      }
      results={
        result ? (
          <>
            <ResultHero kicker={t.calcPages.pace.paceMinPerKm} value={formatMinutesToClock(result.paceMinPerKm)} unit="/km" />
            <StatGrid
              cells={[
                { label: t.calcPages.pace.paceMinPerMi, value: `${formatMinutesToClock(result.paceMinPerMi)} /mi` },
                { label: t.calcPages.pace.speedKmh, value: fmtDecimal(result.speedKmh, lang, 1) },
                { label: t.calcPages.pace.speedMph, value: fmtDecimal(result.speedMph, lang, 1) },
              ]}
            />
          </>
        ) : (
          <ResultPlaceholder title={t.calcPages.resultEmptyTitle} body={t.calcPages.resultEmptyBody} />
        )
      }
    />
  );
}
