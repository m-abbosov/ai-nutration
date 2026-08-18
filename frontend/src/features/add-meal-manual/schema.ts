import { z } from "zod";

export const manualMealSchema = z.object({
  mealType: z.enum(["BREAKFAST", "LUNCH", "SNACK", "DINNER"]),
  name: z.string().min(1, "required"),
  calories: z.coerce.number({ invalid_type_error: "required" }).min(0, "mustBePositive"),
  protein: z.coerce.number({ invalid_type_error: "required" }).min(0, "mustBePositive"),
  carbs: z.coerce.number({ invalid_type_error: "required" }).min(0, "mustBePositive"),
  fat: z.coerce.number({ invalid_type_error: "required" }).min(0, "mustBePositive"),
  servingSize: z.string().optional(),
});

export type ManualMealFormValues = z.infer<typeof manualMealSchema>;
