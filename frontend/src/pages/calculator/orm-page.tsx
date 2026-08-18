import { useState } from "react";

import { useTranslation } from "@nutriai/shared/i18n";
import { fmtDecimal } from "@nutriai/shared/lib/format";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { calculateOneRepMax } from "@/entities/calculator/lib/formulas";
import { kgToLb } from "@/entities/calculator/lib/units";

import { CalculatorShell, ErrorBanner, ResultHero, ResultPlaceholder } from "./calculator-shell";
import { FormulaTable } from "./formula-table";
import { UnitToggle, WeightField, useUnitSystem } from "./unit-fields";
import { useLogCalculatorUsage } from "./use-log-usage";

export default function OrmPage() {
  const { t, lang } = useTranslation();
  const [unit, setUnit] = useUnitSystem();
  const [weightLifted, setWeightLifted] = useState("80");
  const [reps, setReps] = useState("8");

  const w = parseFloat(weightLifted);
  const r = parseInt(reps, 10);
  const ok = w > 0 && r > 0 && r < 37;

  const result = ok ? calculateOneRepMax(w, r) : null;
  useLogCalculatorUsage("orm", { weightLifted: w, reps: r, unit }, result);
  const wValue = (kg: number) => fmtDecimal(unit === "us" ? kgToLb(kg) : kg, lang, 1);
  const wUnit = unit === "us" ? "lb" : "kg";

  return (
    <CalculatorShell
      calcId="orm"
      inputs={
        <div>
          <UnitToggle unit={unit} onChange={setUnit} />
          <div className="grid grid-cols-2 gap-3.5">
            <WeightField id="weight" label={t.calcPages.fields.weightLifted} unit={unit} weightKg={weightLifted} onWeightKgChange={setWeightLifted} />
            <div>
              <Label htmlFor="reps">{t.calcPages.fields.reps}</Label>
              <Input id="reps" type="number" value={reps} onChange={(e) => setReps(e.target.value)} />
            </div>
          </div>
          {!ok && <ErrorBanner message={t.calcPages.invalidInput} />}
        </div>
      }
      results={
        result ? (
          <>
            <ResultHero kicker={t.calcPages.orm.epley} value={wValue(result.epley)} unit={wUnit} />
            <FormulaTable
              rows={[
                { label: t.calcPages.orm.epley, value: `${wValue(result.epley)} ${wUnit}`, highlight: true },
                {
                  label: t.calcPages.orm.brzycki,
                  value: result.brzycki != null ? `${wValue(result.brzycki)} ${wUnit}` : "—",
                },
                { label: t.calcPages.orm.lombardi, value: `${wValue(result.lombardi)} ${wUnit}` },
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
