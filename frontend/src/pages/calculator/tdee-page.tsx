import { useState } from "react";

import type { ActivityLevel, Gender } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";
import { fmtNumber } from "@nutriai/shared/lib/format";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

import { calculateBmr, calculateTdee } from "@/entities/user/lib/helpers";

import { CalculatorShell, ErrorBanner, ResultHero, ResultPlaceholder } from "./calculator-shell";
import { StatGrid } from "./stat-grid";
import { HeightField, UnitToggle, WeightField, useUnitSystem } from "./unit-fields";
import { useLogCalculatorUsage } from "./use-log-usage";

export default function TdeePage() {
  const { t, lang } = useTranslation();
  const [unit, setUnit] = useUnitSystem();
  const [gender, setGender] = useState<Gender>("MALE");
  const [age, setAge] = useState("28");
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("72");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("MODERATE");

  const a = parseInt(age, 10);
  const h = parseFloat(heightCm);
  const w = parseFloat(weightKg);
  const ok = a > 0 && a < 120 && h > 0 && w > 0;

  const bmr = ok ? calculateBmr(a, h, w, gender) : null;
  const tdee = bmr != null ? calculateTdee(bmr, activityLevel) : null;
  useLogCalculatorUsage(
    "tdee",
    { gender, age: a, heightCm: h, weightKg: w, activityLevel, unit },
    tdee != null && bmr != null ? { bmr, tdee } : null,
  );

  return (
    <CalculatorShell
      calcId="tdee"
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
        tdee != null && bmr != null ? (
          <>
            <ResultHero kicker={t.calcPages.tdee.resultLabel} value={fmtNumber(tdee, lang)} unit={t.kcal} />
            <StatGrid cells={[{ label: t.calcPages.bmr.resultLabel, value: `${fmtNumber(bmr, lang)} ${t.kcal}` }]} />
          </>
        ) : (
          <ResultPlaceholder title={t.calcPages.resultEmptyTitle} body={t.calcPages.resultEmptyBody} />
        )
      }
    />
  );
}
