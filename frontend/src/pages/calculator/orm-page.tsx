import { useState } from "react";

import { useTranslation } from "@nutriai/shared/i18n";
import { fmtDecimal } from "@nutriai/shared/lib/format";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { calculateOneRepMax } from "@/entities/calculator/lib/formulas";

import { CalculatorShell, ErrorBanner, ResultHero, ResultPlaceholder } from "./calculator-shell";
import { FormulaTable } from "./formula-table";

export default function OrmPage() {
  const { t, lang } = useTranslation();
  const [weightLifted, setWeightLifted] = useState("80");
  const [reps, setReps] = useState("8");

  const w = parseFloat(weightLifted);
  const r = parseInt(reps, 10);
  const ok = w > 0 && r > 0 && r < 37;

  const result = ok ? calculateOneRepMax(w, r) : null;

  return (
    <CalculatorShell
      calcId="orm"
      inputs={
        <div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label htmlFor="weight">{t.calcPages.fields.weightLifted} · KG</Label>
              <Input id="weight" type="number" value={weightLifted} onChange={(e) => setWeightLifted(e.target.value)} />
            </div>
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
            <ResultHero kicker={t.calcPages.orm.epley} value={fmtDecimal(result.epley, lang, 1)} unit="kg" />
            <FormulaTable
              rows={[
                { label: t.calcPages.orm.epley, value: `${fmtDecimal(result.epley, lang, 1)} kg`, highlight: true },
                {
                  label: t.calcPages.orm.brzycki,
                  value: result.brzycki != null ? `${fmtDecimal(result.brzycki, lang, 1)} kg` : "—",
                },
                { label: t.calcPages.orm.lombardi, value: `${fmtDecimal(result.lombardi, lang, 1)} kg` },
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
