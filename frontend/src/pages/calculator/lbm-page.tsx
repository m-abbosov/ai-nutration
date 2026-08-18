import { useState } from "react";

import type { Gender } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";
import { fmtDecimal } from "@nutriai/shared/lib/format";

import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

import { calculateLeanBodyMass } from "@/entities/calculator/lib/formulas";
import { kgToLb } from "@/entities/calculator/lib/units";

import { CalculatorShell, ErrorBanner, ResultHero, ResultPlaceholder } from "./calculator-shell";
import { FormulaTable } from "./formula-table";
import { StatGrid } from "./stat-grid";
import { HeightField, UnitToggle, WeightField, useUnitSystem } from "./unit-fields";
import { useLogCalculatorUsage } from "./use-log-usage";

export default function LbmPage() {
  const { t, lang } = useTranslation();
  const [unit, setUnit] = useUnitSystem();
  const [gender, setGender] = useState<Gender>("MALE");
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("72");

  const h = parseFloat(heightCm);
  const w = parseFloat(weightKg);
  const ok = h > 0 && w > 0;

  const result = ok ? calculateLeanBodyMass(gender, h, w) : null;
  useLogCalculatorUsage("lbm", { gender, heightCm: h, weightKg: w, unit }, result);
  const wValue = (kg: number) => fmtDecimal(unit === "us" ? kgToLb(kg) : kg, lang, 1);
  const wUnit = unit === "us" ? "lb" : "kg";

  return (
    <CalculatorShell
      calcId="lbm"
      inputs={
        <div>
          <UnitToggle unit={unit} onChange={setUnit} />
          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2">
              <Label>{t.app.genderLabelField}</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">{t.genderLabel.MALE}</SelectItem>
                  <SelectItem value="FEMALE">{t.genderLabel.FEMALE}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <HeightField id="height" unit={unit} heightCm={heightCm} onHeightCmChange={setHeightCm} />
            <WeightField id="weight" label={t.calcPages.fields.weight} unit={unit} weightKg={weightKg} onWeightKgChange={setWeightKg} />
          </div>
          {!ok && <ErrorBanner message={t.calcPages.invalidInput} />}
        </div>
      }
      results={
        result ? (
          <>
            <ResultHero kicker={t.calcPages.lbm.resultLabel} value={wValue(result.boerKg)} unit={wUnit} />
            <StatGrid cells={[{ label: t.calcPages.lbm.fatMass, value: `${wValue(result.fatMassKg)} ${wUnit}` }]} />
            <FormulaTable
              rows={[
                { label: t.calcPages.lbm.boer, value: `${wValue(result.boerKg)} ${wUnit}`, highlight: true },
                { label: t.calcPages.lbm.james, value: `${wValue(result.jamesKg)} ${wUnit}` },
                { label: t.calcPages.lbm.hume, value: `${wValue(result.humeKg)} ${wUnit}` },
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
