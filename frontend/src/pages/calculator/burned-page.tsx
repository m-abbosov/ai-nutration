import { useState } from "react";

import { useTranslation } from "@nutriai/shared/i18n";
import { fmtNumber } from "@nutriai/shared/lib/format";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

import { MET_ACTIVITIES, type MetActivityId, calculateCaloriesBurned } from "@/entities/calculator/lib/formulas";

import { CalculatorShell, ErrorBanner, ResultHero, ResultPlaceholder } from "./calculator-shell";
import { UnitToggle, WeightField, useUnitSystem } from "./unit-fields";
import { useLogCalculatorUsage } from "./use-log-usage";

export default function BurnedPage() {
  const { t, lang } = useTranslation();
  const [unit, setUnit] = useUnitSystem();
  const [activityId, setActivityId] = useState<MetActivityId>("runModerate");
  const [weightKg, setWeightKg] = useState("72");
  const [durationMinutes, setDurationMinutes] = useState("30");

  const w = parseFloat(weightKg);
  const dur = parseFloat(durationMinutes);
  const ok = w > 0 && dur > 0;

  const activity = MET_ACTIVITIES.find((a) => a.id === activityId)!;
  const kcal = ok ? calculateCaloriesBurned(activity.met, w, dur) : null;
  useLogCalculatorUsage("burned", { activityId, weightKg: w, durationMinutes: dur, unit }, kcal != null ? { kcal } : null);

  return (
    <CalculatorShell
      calcId="burned"
      inputs={
        <div>
          <UnitToggle unit={unit} onChange={setUnit} />
          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2">
              <Label>{t.calcPages.fields.activity}</Label>
              <Select value={activityId} onValueChange={(v) => setActivityId(v as MetActivityId)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MET_ACTIVITIES.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {t.calcPages.burned.activities[a.id]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <WeightField id="weight" label={t.calcPages.fields.weight} unit={unit} weightKg={weightKg} onWeightKgChange={setWeightKg} />
            <div>
              <Label htmlFor="duration">{t.calcPages.fields.time} · min</Label>
              <Input id="duration" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
            </div>
          </div>
          {!ok && <ErrorBanner message={t.calcPages.invalidInput} />}
        </div>
      }
      results={
        kcal != null ? (
          <ResultHero kicker={t.calcPages.burned.resultLabel} value={fmtNumber(Math.round(kcal), lang)} unit={t.kcal} />
        ) : (
          <ResultPlaceholder title={t.calcPages.resultEmptyTitle} body={t.calcPages.resultEmptyBody} />
        )
      }
    />
  );
}
