import { useState } from "react";

import type { Gender } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";
import { fmtDecimal } from "@nutriai/shared/lib/format";

import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

import { calculateIdealWeight } from "@/entities/calculator/lib/formulas";
import { kgToLb } from "@/entities/calculator/lib/units";

import { CalculatorShell, ErrorBanner, ResultHero, ResultPlaceholder } from "./calculator-shell";
import { FormulaTable } from "./formula-table";
import { HeightField, UnitToggle, useUnitSystem } from "./unit-fields";
import { useLogCalculatorUsage } from "./use-log-usage";

export default function IdealPage() {
  const { t, lang } = useTranslation();
  const [unit, setUnit] = useUnitSystem();
  const [gender, setGender] = useState<Gender>("MALE");
  const [heightCm, setHeightCm] = useState("175");

  const h = parseFloat(heightCm);
  const ok = h > 0 && heightCm !== "";
  const result = ok ? calculateIdealWeight(gender, h) : null;
  useLogCalculatorUsage("ideal", { gender, heightCm: h, unit }, result);
  const wValue = (kg: number) => fmtDecimal(unit === "us" ? kgToLb(kg) : kg, lang, 1);
  const fmtW = (kg: number) => `${wValue(kg)} ${unit === "us" ? "lb" : "kg"}`;

  return (
    <CalculatorShell
      calcId="ideal"
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
            <div className="col-span-2">
              <HeightField id="height" unit={unit} heightCm={heightCm} onHeightCmChange={setHeightCm} />
            </div>
          </div>
          {!ok && <ErrorBanner message={t.calcPages.invalidInput} />}
          <p className="mt-4 text-[11.5px] leading-[1.5] text-tx3">{t.calcPages.ideal.recommended}</p>
        </div>
      }
      results={
        result ? (
          <>
            <ResultHero kicker={t.calcPages.ideal.resultLabel} value={wValue(result.devineKg)} unit={unit === "us" ? "lb" : "kg"} />
            <FormulaTable
              rows={[
                { label: t.calcPages.ideal.hamwi, value: fmtW(result.hamwiKg) },
                { label: t.calcPages.ideal.devine, value: fmtW(result.devineKg), highlight: true },
                { label: t.calcPages.ideal.robinson, value: fmtW(result.robinsonKg) },
                { label: t.calcPages.ideal.miller, value: fmtW(result.millerKg) },
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
