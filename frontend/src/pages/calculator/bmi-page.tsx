import { useState } from "react";

import { useTranslation } from "@nutriai/shared/i18n";
import { fmtDecimal } from "@nutriai/shared/lib/format";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { calculateBmi } from "@/entities/calculator/lib/formulas";

import { CalculatorShell, ErrorBanner, ResultHero, ResultPlaceholder } from "./calculator-shell";
import { GaugeBar } from "./gauge-bar";
import { StatGrid } from "./stat-grid";

const CATEGORY_TONE = {
  under: { color: "var(--pro)", tint: "var(--proT)" },
  normal: { color: "var(--acc)", tint: "var(--accT)" },
  over: { color: "var(--carb)", tint: "var(--carbT)" },
  obese: { color: "var(--fat)", tint: "var(--fatT)" },
} as const;

export default function BmiPage() {
  const { t, lang } = useTranslation();
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("72");

  const h = parseFloat(heightCm);
  const w = parseFloat(weightKg);
  const hOk = h >= 100 && h <= 250;
  const wOk = w >= 20 && w <= 300;
  const ok = hOk && wOk && heightCm !== "" && weightKg !== "";

  const result = ok ? calculateBmi(h, w) : null;

  return (
    <CalculatorShell
      calcId="bmi"
      inputs={
        <div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label htmlFor="height">{t.calcPages.fields.height} · CM</Label>
              <Input id="height" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="weight">{t.calcPages.fields.weight} · KG</Label>
              <Input id="weight" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </div>
          </div>
          {!ok && (heightCm !== "" || weightKg !== "") && <ErrorBanner message={t.calcPages.invalidInput} />}
        </div>
      }
      results={
        result ? (
          <>
            <ResultHero
              kicker={t.calcPages.bmi.resultLabel}
              value={fmtDecimal(result.bmi, lang, 1)}
              tone={{ ...CATEGORY_TONE[result.category], label: t.calcPages.bmi.categories[result.category] }}
            />
            <GaugeBar
              segments={[
                { color: "var(--pro)", widthPct: 19 },
                { color: "var(--acc)", widthPct: 26 },
                { color: "var(--carb)", widthPct: 23 },
                { color: "var(--fat)", widthPct: 32 },
              ]}
              markerPct={result.markerPct}
              ticks={["15", "18.5", "25", "30", "40"]}
              legend={[
                { color: "var(--pro)", label: t.calcPages.bmi.categories.under },
                { color: "var(--acc)", label: t.calcPages.bmi.categories.normal },
                { color: "var(--carb)", label: t.calcPages.bmi.categories.over },
                { color: "var(--fat)", label: t.calcPages.bmi.categories.obese },
              ]}
            />
            <StatGrid
              cells={[
                {
                  label: t.calcPages.bmi.healthyRange,
                  value: `${fmtDecimal(result.healthyMinKg, lang, 1)} – ${fmtDecimal(result.healthyMaxKg, lang, 1)} kg`,
                },
                { label: t.calcPages.bmi.bmiPrime, value: fmtDecimal(result.bmiPrime, lang, 2) },
                { label: t.calcPages.bmi.ponderalIndex, value: `${fmtDecimal(result.ponderalIndex, lang, 1)} kg/m³` },
              ]}
            />
            <div className="mt-5">
              <div className="mb-1.5 text-[12.5px] font-semibold">{t.calcPages.bmi.whatMeans}</div>
              <p className="text-[13px] leading-[1.55] text-tx2 text-pretty">{t.calcPages.bmi.meanings[result.category]}</p>
            </div>
          </>
        ) : (
          <ResultPlaceholder title={t.calcPages.resultEmptyTitle} body={t.calcPages.resultEmptyBody} />
        )
      }
    />
  );
}
