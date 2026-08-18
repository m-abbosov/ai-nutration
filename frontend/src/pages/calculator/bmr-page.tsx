import { useState } from "react";

import type { Gender } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";
import { fmtNumber } from "@nutriai/shared/lib/format";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

import { calculateBmr } from "@/entities/user/lib/helpers";

import { CalculatorShell, ErrorBanner, ResultHero, ResultPlaceholder } from "./calculator-shell";
import { HeightField, UnitToggle, WeightField, useUnitSystem } from "./unit-fields";
import { useLogCalculatorUsage } from "./use-log-usage";

export default function BmrPage() {
  const { t, lang } = useTranslation();
  const [unit, setUnit] = useUnitSystem();
  const [gender, setGender] = useState<Gender>("MALE");
  const [age, setAge] = useState("28");
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("72");

  const a = parseInt(age, 10);
  const h = parseFloat(heightCm);
  const w = parseFloat(weightKg);
  const ok = a > 0 && a < 120 && h > 0 && w > 0;

  const bmr = ok ? calculateBmr(a, h, w, gender) : null;
  useLogCalculatorUsage("bmr", { gender, age: a, heightCm: h, weightKg: w, unit }, bmr != null ? { bmr } : null);

  return (
    <CalculatorShell
      calcId="bmr"
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
                  <SelectItem value="OTHER">{t.genderLabel.OTHER}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="age">{t.calcPages.fields.age}</Label>
              <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <HeightField id="height" unit={unit} heightCm={heightCm} onHeightCmChange={setHeightCm} />
            <div className="col-span-2">
              <WeightField id="weight" label={t.calcPages.fields.weight} unit={unit} weightKg={weightKg} onWeightKgChange={setWeightKg} />
            </div>
          </div>
          {!ok && <ErrorBanner message={t.calcPages.invalidInput} />}
        </div>
      }
      results={
        bmr != null ? (
          <ResultHero kicker={t.calcPages.bmr.resultLabel} value={fmtNumber(bmr, lang)} unit={t.kcal} />
        ) : (
          <ResultPlaceholder title={t.calcPages.resultEmptyTitle} body={t.calcPages.resultEmptyBody} />
        )
      }
    />
  );
}
