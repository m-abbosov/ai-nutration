import { useState } from "react";

import { useTranslation } from "@nutriai/shared/i18n";
import { fmtDecimal } from "@nutriai/shared/lib/format";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

import { calculateWaterLiters } from "@/entities/calculator/lib/formulas";

import { CalculatorShell, ErrorBanner, ResultHero, ResultPlaceholder } from "./calculator-shell";

export default function WaterPage() {
  const { t, lang } = useTranslation();
  const [weightKg, setWeightKg] = useState("72");
  const [exerciseMinutes, setExerciseMinutes] = useState("30");
  const [hotClimate, setHotClimate] = useState(false);

  const w = parseFloat(weightKg);
  const ex = parseFloat(exerciseMinutes) || 0;
  const ok = w > 0;

  const liters = ok ? calculateWaterLiters(w, ex, hotClimate) : null;

  return (
    <CalculatorShell
      calcId="water"
      inputs={
        <div>
          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2">
              <Label htmlFor="weight">{t.calcPages.fields.weight} · KG</Label>
              <Input id="weight" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="exercise">
                {t.calcPages.fields.exerciseMinutes} <span className="text-tx3">({t.calcPages.fields.optional})</span>
              </Label>
              <Input id="exercise" type="number" value={exerciseMinutes} onChange={(e) => setExerciseMinutes(e.target.value)} />
            </div>
          </div>
          <div className="mt-3.5 flex items-center justify-between rounded-[12px] border border-line bg-surf px-3.5 py-3">
            <Label htmlFor="hot" className="mb-0">
              {t.calcPages.fields.hotClimate}
            </Label>
            <Switch id="hot" checked={hotClimate} onCheckedChange={setHotClimate} />
          </div>
          {!ok && <ErrorBanner message={t.calcPages.invalidInput} />}
        </div>
      }
      results={
        liters != null ? (
          <>
            <ResultHero kicker={t.calcPages.water.resultLabel} value={fmtDecimal(liters, lang, 1)} unit="L" />
            <p className="mt-5 text-center text-[12.5px] leading-[1.55] text-tx3">{t.calcPages.water.tip}</p>
          </>
        ) : (
          <ResultPlaceholder title={t.calcPages.resultEmptyTitle} body={t.calcPages.resultEmptyBody} />
        )
      }
    />
  );
}
