import { useEffect, useRef } from "react";

import { useRecordCalculatorUsage } from "@/shared/api/calculators";

/**
 * Logs one usage event ~1s after a calculator settles on a valid, distinct
 * result (debounced so typing doesn't fire a request per keystroke). Never
 * surfaces errors to the calculator UI — this is analytics-only.
 */
export function useLogCalculatorUsage(calcId: string, inputs: object, result: object | null) {
  const record = useRecordCalculatorUsage();
  const recordRef = useRef(record.mutate);
  recordRef.current = record.mutate;
  const lastKey = useRef<string | null>(null);
  const inputsKey = JSON.stringify(inputs);
  const resultKey = result ? JSON.stringify(result) : null;

  useEffect(() => {
    if (!resultKey) return;
    const key = `${inputsKey}|${resultKey}`;
    if (key === lastKey.current) return;

    const timer = setTimeout(() => {
      lastKey.current = key;
      recordRef.current({ calculatorId: calcId, inputs: JSON.parse(inputsKey), result: JSON.parse(resultKey) });
    }, 900);
    return () => clearTimeout(timer);
  }, [calcId, inputsKey, resultKey]);
}
