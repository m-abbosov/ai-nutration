import { useState } from "react";

import type { ActivityLevel, Gender, Goal } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";
import { fmtNumber } from "@nutriai/shared/lib/format";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

import { previewTargets } from "@/entities/user/lib/helpers";

import { CalculatorShell, ErrorBanner, ResultHero, ResultPlaceholder } from "./calculator-shell";

export default function CaloriesPage() {
  const { t, lang } = useTranslation();
  const [gender, setGender] = useState<Gender>("MALE");
  const [age, setAge] = useState("28");
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("72");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("MODERATE");
  const [goal, setGoal] = useState<Goal>("MAINTAIN");

  const a = parseInt(age, 10);
  const h = parseFloat(heightCm);
  const w = parseFloat(weightKg);
  const ok = a > 0 && a < 120 && h > 0 && w > 0;

  const result = ok ? previewTargets({ age: a, heightCm: h, weightKg: w, gender, activityLevel, goal }) : null;

  return (
    <CalculatorShell
      calcId="calories"
      inputs={
        <div>
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
            <div>
              <Label htmlFor="height">{t.calcPages.fields.height} · CM</Label>
              <Input id="height" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="weight">{t.calcPages.fields.weight} · KG</Label>
              <Input id="weight" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </div>
            <div>
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
            <div>
              <Label>{t.prGoal}</Label>
              <Select value={goal} onValueChange={(v) => setGoal(v as Goal)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOSE">{t.goalLabel.LOSE}</SelectItem>
                  <SelectItem value="MAINTAIN">{t.goalLabel.MAINTAIN}</SelectItem>
                  <SelectItem value="GAIN">{t.goalLabel.GAIN}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {!ok && <ErrorBanner message={t.calcPages.invalidInput} />}
        </div>
      }
      results={
        result ? (
          <ResultHero kicker={t.calcPages.calories.resultLabel} value={fmtNumber(result.dailyCalorieTarget, lang)} unit={t.kcal} />
        ) : (
          <ResultPlaceholder title={t.calcPages.resultEmptyTitle} body={t.calcPages.resultEmptyBody} />
        )
      }
    />
  );
}
