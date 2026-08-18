import { useState } from "react";

import type { ActivityLevel } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";
import { fmtNumber } from "@nutriai/shared/lib/format";

import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

import { calculateProtein } from "@/entities/calculator/lib/formulas";

import { CalculatorShell, ErrorBanner, ResultHero, ResultPlaceholder } from "./calculator-shell";
import { UnitToggle, WeightField, useUnitSystem } from "./unit-fields";
import { useLogCalculatorUsage } from "./use-log-usage";

export default function ProteinPage() {
  const { t, lang } = useTranslation();
  const [unit, setUnit] = useUnitSystem();
  const [weightKg, setWeightKg] = useState("72");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("MODERATE");

  const w = parseFloat(weightKg);
  const ok = w > 0;

  const result = ok ? calculateProtein(w, activityLevel) : null;
  useLogCalculatorUsage("protein", { weightKg: w, activityLevel, unit }, result);

  return (
    <CalculatorShell
      calcId="protein"
      inputs={
        <div>
          <UnitToggle unit={unit} onChange={setUnit} />
          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2">
              <WeightField id="weight" label={t.calcPages.fields.weight} unit={unit} weightKg={weightKg} onWeightKgChange={setWeightKg} />
            </div>
            <div className="col-span-2">
              <Label>{t.prAct}</Label>
              <Select value={activityLevel} onValueChange={(v) => setActivityLevel(v as ActivityLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEDENTARY">{t.activityLabel.SEDENTARY}</SelectItem>
                  <SelectItem value="LIGHT">{t.activityLabel.LIGHT}</SelectItem>
                  <SelectItem value="MODERATE">{t.activityLabel.MODERATE}</SelectItem>
                  <SelectItem value="ACTIVE">{t.activityLabel.ACTIVE}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {!ok && <ErrorBanner message={t.calcPages.invalidInput} />}
        </div>
      }
      results={
        result ? (
          <>
            <ResultHero kicker={t.calcPages.protein.resultLabel} value={fmtNumber(result.proteinG, lang)} unit="g" />
            <p className="mt-5 text-center text-[12.5px] leading-[1.55] text-tx3">{t.calcPages.protein.note}</p>
          </>
        ) : (
          <ResultPlaceholder title={t.calcPages.resultEmptyTitle} body={t.calcPages.resultEmptyBody} />
        )
      }
    />
  );
}
