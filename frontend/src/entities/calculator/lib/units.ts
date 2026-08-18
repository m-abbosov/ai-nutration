import type { Language } from "@nutriai/shared/api/types";

export type UnitSystem = "metric" | "us";

const CM_PER_IN = 2.54;
const KG_PER_LB = 0.45359237;
const KM_PER_MI = 1.609344;

export function cmToIn(cm: number): number {
  return cm / CM_PER_IN;
}

export function inToCm(inches: number): number {
  return inches * CM_PER_IN;
}

export function cmToFtIn(cm: number): { ft: number; inch: number } {
  const totalIn = cm / CM_PER_IN;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn - ft * 12);
  return inch === 12 ? { ft: ft + 1, inch: 0 } : { ft, inch };
}

export function ftInToCm(ft: number, inch: number): number {
  return (ft * 12 + inch) * CM_PER_IN;
}

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

export function kmToMi(km: number): number {
  return km / KM_PER_MI;
}

export function miToKm(mi: number): number {
  return mi * KM_PER_MI;
}

/** EN defaults to US units (ft/in, lb); UZ/RU default to metric (cm/kg). */
export function defaultUnitForLang(lang: Language): UnitSystem {
  return lang === "EN" ? "us" : "metric";
}
