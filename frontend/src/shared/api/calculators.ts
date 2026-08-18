import { api } from "@nutriai/shared/api/client";
import { useMutation } from "@tanstack/react-query";

export interface RecordCalculatorUsagePayload {
  calculatorId: string;
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
}

/** Fire-and-forget analytics write — never blocks the calculator UI, no
 * cache invalidation needed since nothing in the app reads this data back. */
export function useRecordCalculatorUsage() {
  return useMutation({
    mutationFn: (payload: RecordCalculatorUsagePayload) => api.post<void>("/calculators/usage", payload),
  });
}
