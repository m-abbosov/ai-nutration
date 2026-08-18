import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { shiftDateISO, todayLocalISO } from "@nutriai/shared/lib/format";

interface SelectedDateContextValue {
  date: string;
  isToday: boolean;
  setDate: (date: string) => void;
  shiftDay: (delta: number) => void;
  goToday: () => void;
}

const SelectedDateContext = createContext<SelectedDateContextValue | null>(null);

export function SelectedDateProvider({ children }: { children: ReactNode }) {
  const [date, setDate] = useState(todayLocalISO());

  const value = useMemo<SelectedDateContextValue>(
    () => ({
      date,
      isToday: date === todayLocalISO(),
      setDate,
      shiftDay: (delta) => setDate((d) => shiftDateISO(d, delta)),
      goToday: () => setDate(todayLocalISO()),
    }),
    [date],
  );

  return <SelectedDateContext.Provider value={value}>{children}</SelectedDateContext.Provider>;
}

export function useSelectedDate(): SelectedDateContextValue {
  const ctx = useContext(SelectedDateContext);
  if (!ctx) throw new Error("useSelectedDate must be used within SelectedDateProvider");
  return ctx;
}
