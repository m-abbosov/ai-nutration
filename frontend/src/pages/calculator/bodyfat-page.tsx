import { useState } from "react";

import type { Gender } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";
import { fmtDecimal } from "@nutriai/shared/lib/format";

import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

import { calculateBodyFat } from "@/entities/calculator/lib/formulas";

import { CalculatorShell, ErrorBanner, ResultHero, ResultPlaceholder } from "./calculator-shell";
import { GirthField, HeightField, UnitToggle, useUnitSystem } from "./unit-fields";
import { useLogCalculatorUsage } from "./use-log-usage";

const CATEGORY_TONE = {
  essential: { color: "var(--pro)", tint: "var(--proT)" },
  athletes: { color: "var(--acc)", tint: "var(--accT)" },
  fitness: { color: "var(--acc)", tint: "var(--accT)" },
  average: { color: "var(--carb)", tint: "var(--carbT)" },
  obese: { color: "var(--fat)", tint: "var(--fatT)" },
} as const;

const CATEGORY_ORDER = ["essential", "athletes", "fitness", "average", "obese"] as const;

export default function BodyFatPage() {
  const { t, lang } = useTranslation();
  const [unit, setUnit] = useUnitSystem();
  const [gender, setGender] = useState<Gender>("MALE");
  const [heightCm, setHeightCm] = useState("175");
  const [neckCm, setNeckCm] = useState("38");
  const [waistCm, setWaistCm] = useState("85");
  const [hipCm, setHipCm] = useState("95");

  const isFemale = gender === "FEMALE";
  const h = parseFloat(heightCm);
  const neck = parseFloat(neckCm);
  const waist = parseFloat(waistCm);
  const hip = parseFloat(hipCm);
  const ok = h > 0 && neck > 0 && waist > neck && (!isFemale || (hip > 0 && waist + hip > neck));

  const result = ok ? calculateBodyFat(gender, h, neck, waist, isFemale ? hip : undefined) : null;
  useLogCalculatorUsage("bodyfat", { gender, heightCm: h, neckCm: neck, waistCm: waist, hipCm: isFemale ? hip : undefined, unit }, result);

  return (
    <CalculatorShell
      calcId="bodyfat"
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
            <GirthField id="neck" label={t.calcPages.fields.neck} unit={unit} valueCm={neckCm} onValueCmChange={setNeckCm} />
            <GirthField id="waist" label={t.calcPages.fields.waist} unit={unit} valueCm={waistCm} onValueCmChange={setWaistCm} />
            {isFemale && <GirthField id="hip" label={t.calcPages.fields.hip} unit={unit} valueCm={hipCm} onValueCmChange={setHipCm} />}
          </div>
          {isFemale && <p className="mt-2 text-[11.5px] text-tx3">{t.calcPages.bodyfat.hipHint}</p>}
          {!ok && <ErrorBanner message={t.calcPages.invalidInput} />}
        </div>
      }
      results={
        result ? (
          <>
            <ResultHero
              kicker={t.calcPages.bodyfat.resultLabel}
              value={fmtDecimal(result.bodyFatPercent, lang, 1)}
              unit="%"
              tone={{ ...CATEGORY_TONE[result.category], label: t.calcPages.bodyfat.categories[result.category] }}
            />
            <div className="mt-5 flex flex-col gap-1.5">
              {CATEGORY_ORDER.map((c) => (
                <div
                  key={c}
                  className="flex items-center justify-between rounded-[10px] px-3 py-2 text-[12.5px]"
                  style={{ background: c === result.category ? CATEGORY_TONE[c].tint : "transparent" }}
                >
                  <span style={{ color: c === result.category ? CATEGORY_TONE[c].color : "var(--tx2)" }}>{t.calcPages.bodyfat.categories[c]}</span>
                  {c === result.category && <span className="h-1.5 w-1.5 rounded-full" style={{ background: CATEGORY_TONE[c].color }} />}
                </div>
              ))}
            </div>
          </>
        ) : (
          <ResultPlaceholder title={t.calcPages.resultEmptyTitle} body={t.calcPages.resultEmptyBody} />
        )
      }
    />
  );
}
