import { useState } from "react";

import { useTranslation } from "@nutriai/shared/i18n";
import { cn } from "@nutriai/shared/lib/cn";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import {
  type UnitSystem,
  cmToFtIn,
  cmToIn,
  defaultUnitForLang,
  ftInToCm,
  inToCm,
  kgToLb,
  kmToMi,
  lbToKg,
  miToKm,
} from "@/entities/calculator/lib/units";

export function useUnitSystem(): [UnitSystem, (u: UnitSystem) => void] {
  const { lang } = useTranslation();
  return useState<UnitSystem>(() => defaultUnitForLang(lang));
}

export function UnitToggle({ unit, onChange }: { unit: UnitSystem; onChange: (u: UnitSystem) => void }) {
  const { t } = useTranslation();
  return (
    <div role="tablist" aria-label="units" className="mb-3.5 inline-flex gap-0.5 rounded-[10px] border border-line2 bg-surf p-0.5">
      {(["metric", "us"] as const).map((u) => (
        <button
          key={u}
          type="button"
          role="tab"
          aria-selected={unit === u}
          onClick={() => onChange(u)}
          className={cn(
            "rounded-[8px] px-3 py-[7px] text-[12px] font-medium transition-colors",
            unit === u ? "bg-accT text-acc" : "text-tx2 hover:text-tx",
          )}
        >
          {u === "metric" ? t.calcPages.units.metric : t.calcPages.units.us}
        </button>
      ))}
    </div>
  );
}

/** Height field: single CM input in metric mode, ft+in pair in US mode. Value/onChange always carry cm. */
export function HeightField({
  id,
  unit,
  heightCm,
  onHeightCmChange,
}: {
  id: string;
  unit: UnitSystem;
  heightCm: string;
  onHeightCmChange: (cm: string) => void;
}) {
  const { t } = useTranslation();

  if (unit === "metric") {
    return (
      <div>
        <Label htmlFor={id}>{t.calcPages.fields.height} · CM</Label>
        <Input id={id} type="number" value={heightCm} onChange={(e) => onHeightCmChange(e.target.value)} />
      </div>
    );
  }

  const { ft, inch } = cmToFtIn(parseFloat(heightCm) || 0);
  return (
    <div>
      <Label htmlFor={id}>
        {t.calcPages.fields.height} · {t.calcPages.units.ft}/{t.calcPages.units.in}
      </Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="number"
          value={Number.isFinite(ft) ? String(ft) : ""}
          onChange={(e) => onHeightCmChange(String(ftInToCm(parseFloat(e.target.value) || 0, inch)))}
          aria-label={t.calcPages.units.ft}
        />
        <Input
          type="number"
          value={Number.isFinite(inch) ? String(inch) : ""}
          onChange={(e) => onHeightCmChange(String(ftInToCm(ft, parseFloat(e.target.value) || 0)))}
          aria-label={t.calcPages.units.in}
        />
      </div>
    </div>
  );
}

/** Weight field: single KG input in metric mode, LB in US mode. Value/onChange always carry kg. */
export function WeightField({
  id,
  label,
  unit,
  weightKg,
  onWeightKgChange,
}: {
  id: string;
  label: string;
  unit: UnitSystem;
  weightKg: string;
  onWeightKgChange: (kg: string) => void;
}) {
  const { t } = useTranslation();

  if (unit === "metric") {
    return (
      <div>
        <Label htmlFor={id}>{label} · KG</Label>
        <Input id={id} type="number" value={weightKg} onChange={(e) => onWeightKgChange(e.target.value)} />
      </div>
    );
  }

  const lb = kgToLb(parseFloat(weightKg) || 0);
  return (
    <div>
      <Label htmlFor={id}>
        {label} · {t.calcPages.units.lb.toUpperCase()}
      </Label>
      <Input
        id={id}
        type="number"
        value={Number.isFinite(lb) ? String(Math.round(lb * 10) / 10) : ""}
        onChange={(e) => onWeightKgChange(String(lbToKg(parseFloat(e.target.value) || 0)))}
      />
    </div>
  );
}

/** Distance field: single KM input in metric mode, MI in US mode. */
export function DistanceField({
  id,
  label,
  unit,
  distanceKm,
  onDistanceKmChange,
}: {
  id: string;
  label: string;
  unit: UnitSystem;
  distanceKm: string;
  onDistanceKmChange: (km: string) => void;
}) {
  if (unit === "metric") {
    return (
      <div>
        <Label htmlFor={id}>{label} · KM</Label>
        <Input id={id} type="number" value={distanceKm} onChange={(e) => onDistanceKmChange(e.target.value)} />
      </div>
    );
  }

  const mi = kmToMi(parseFloat(distanceKm) || 0);
  return (
    <div>
      <Label htmlFor={id}>{label} · MI</Label>
      <Input
        id={id}
        type="number"
        value={Number.isFinite(mi) ? String(Math.round(mi * 100) / 100) : ""}
        onChange={(e) => onDistanceKmChange(String(miToKm(parseFloat(e.target.value) || 0)))}
      />
    </div>
  );
}

/** Girth/length field (neck, waist, hip): single CM input in metric mode, IN in US mode. */
export function GirthField({
  id,
  label,
  unit,
  valueCm,
  onValueCmChange,
}: {
  id: string;
  label: string;
  unit: UnitSystem;
  valueCm: string;
  onValueCmChange: (cm: string) => void;
}) {
  const { t } = useTranslation();

  if (unit === "metric") {
    return (
      <div>
        <Label htmlFor={id}>{label} · CM</Label>
        <Input id={id} type="number" value={valueCm} onChange={(e) => onValueCmChange(e.target.value)} />
      </div>
    );
  }

  const inches = cmToIn(parseFloat(valueCm) || 0);
  return (
    <div>
      <Label htmlFor={id}>
        {label} · {t.calcPages.units.in.toUpperCase()}
      </Label>
      <Input
        id={id}
        type="number"
        value={Number.isFinite(inches) ? String(Math.round(inches * 10) / 10) : ""}
        onChange={(e) => onValueCmChange(String(inToCm(parseFloat(e.target.value) || 0)))}
      />
    </div>
  );
}
