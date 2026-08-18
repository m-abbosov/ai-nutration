import { useState } from "react";

import { useTranslation } from "@nutriai/shared/i18n";
import { fmtNumber } from "@nutriai/shared/lib/format";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { calculateHeartRateZones } from "@/entities/calculator/lib/formulas";

import { CalculatorShell, ErrorBanner, ResultHero, ResultPlaceholder } from "./calculator-shell";
import { FormulaTable } from "./formula-table";

const ZONE_KEYS = ["zone1", "zone2", "zone3", "zone4", "zone5"] as const;

export default function HrPage() {
  const { t, lang } = useTranslation();
  const [age, setAge] = useState("28");
  const [restingHr, setRestingHr] = useState("");

  const a = parseInt(age, 10);
  const rhr = restingHr === "" ? undefined : parseFloat(restingHr);
  const ok = a > 0 && a < 120 && (rhr === undefined || rhr > 0);

  const result = ok ? calculateHeartRateZones(a, rhr) : null;

  return (
    <CalculatorShell
      calcId="hr"
      inputs={
        <div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label htmlFor="age">{t.calcPages.fields.age}</Label>
              <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="rhr">
                {t.calcPages.fields.restingHr} <span className="text-tx3">({t.calcPages.fields.optional})</span>
              </Label>
              <Input id="rhr" type="number" value={restingHr} onChange={(e) => setRestingHr(e.target.value)} />
            </div>
          </div>
          <p className="mt-2 text-[11.5px] text-tx3">{t.calcPages.fields.restingHrHint}</p>
          {!ok && <ErrorBanner message={t.calcPages.invalidInput} />}
        </div>
      }
      results={
        result ? (
          <>
            <ResultHero kicker={t.calcPages.hr.maxHrLabel} value={fmtNumber(result.maxHr, lang)} unit="bpm" />
            <FormulaTable
              rows={ZONE_KEYS.map((key, i) => ({
                label: t.calcPages.hr.zones[key],
                value: `${result.zones[i].minBpm}–${result.zones[i].maxBpm} bpm`,
              }))}
            />
          </>
        ) : (
          <ResultPlaceholder title={t.calcPages.resultEmptyTitle} body={t.calcPages.resultEmptyBody} />
        )
      }
    />
  );
}
