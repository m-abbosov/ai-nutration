import { useState } from "react";

import type { Gender } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";
import { fmtDecimal } from "@nutriai/shared/lib/format";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

import { calculateIdealWeight } from "@/entities/calculator/lib/formulas";

import { CalculatorShell, ErrorBanner, ResultHero, ResultPlaceholder } from "./calculator-shell";
import { FormulaTable } from "./formula-table";

export default function IdealPage() {
  const { t, lang } = useTranslation();
  const [gender, setGender] = useState<Gender>("MALE");
  const [heightCm, setHeightCm] = useState("175");

  const h = parseFloat(heightCm);
  const ok = h > 0 && heightCm !== "";
  const result = ok ? calculateIdealWeight(gender, h) : null;

  return (
    <CalculatorShell
      calcId="ideal"
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
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="height">{t.calcPages.fields.height} · CM</Label>
              <Input id="height" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            </div>
          </div>
          {!ok && <ErrorBanner message={t.calcPages.invalidInput} />}
          <p className="mt-4 text-[11.5px] leading-[1.5] text-tx3">{t.calcPages.ideal.recommended}</p>
        </div>
      }
      results={
        result ? (
          <>
            <ResultHero kicker={t.calcPages.ideal.resultLabel} value={fmtDecimal(result.devineKg, lang, 1)} unit="kg" />
            <FormulaTable
              rows={[
                { label: t.calcPages.ideal.hamwi, value: `${fmtDecimal(result.hamwiKg, lang, 1)} kg` },
                { label: t.calcPages.ideal.devine, value: `${fmtDecimal(result.devineKg, lang, 1)} kg`, highlight: true },
                { label: t.calcPages.ideal.robinson, value: `${fmtDecimal(result.robinsonKg, lang, 1)} kg` },
                { label: t.calcPages.ideal.miller, value: `${fmtDecimal(result.millerKg, lang, 1)} kg` },
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
