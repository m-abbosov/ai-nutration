import { z } from 'zod'

export const onboardingSchema = z.object({
  goal: z.enum(['LOSE', 'MAINTAIN', 'GAIN']),
  age: z.coerce.number({ invalid_type_error: 'required' }).int().min(10).max(100),
  heightCm: z.coerce.number({ invalid_type_error: 'required' }).min(100).max(250),
  weightKg: z.coerce.number({ invalid_type_error: 'required' }).min(30).max(300),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  goalWeightKg: z.union([z.coerce.number().min(30).max(300), z.literal('')]).optional(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE']),
})

export type OnboardingFormValues = z.infer<typeof onboardingSchema>

export const STEP_FIELDS: (keyof OnboardingFormValues)[][] = [
  ['goal'],
  ['age', 'heightCm', 'weightKg', 'gender', 'goalWeightKg'],
  ['activityLevel'],
  [],
]
