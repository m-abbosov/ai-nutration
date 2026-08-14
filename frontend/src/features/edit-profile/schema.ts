import { z } from 'zod'

export const editProfileSchema = z.object({
  age: z.coerce.number({ invalid_type_error: 'required' }).int().min(10).max(100),
  heightCm: z.coerce.number({ invalid_type_error: 'required' }).min(100).max(250),
  weightKg: z.coerce.number({ invalid_type_error: 'required' }).min(30).max(300),
  goalWeightKg: z.union([z.coerce.number().min(30).max(300), z.literal('')]).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE']),
  goal: z.enum(['LOSE', 'MAINTAIN', 'GAIN']),
})

export type EditProfileFormValues = z.infer<typeof editProfileSchema>
