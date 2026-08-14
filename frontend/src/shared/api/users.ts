import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/query-client'
import type { ActivityLevel, Gender, Goal, Language, Theme, UserDto } from '@/shared/api/types'

export interface OnboardingPayload {
  age: number
  heightCm: number
  weightKg: number
  gender?: Gender
  activityLevel: ActivityLevel
  goal: Goal
  goalWeightKg?: number
}

export function useSubmitOnboarding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: OnboardingPayload) => api.post<UserDto>('/users/onboarding', payload),
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.me, user)
    },
  })
}

export interface UpdateMePayload {
  name?: string
  age?: number
  heightCm?: number
  weightKg?: number
  goalWeightKg?: number
  gender?: Gender
  activityLevel?: ActivityLevel
  goal?: Goal
  language?: Language
  theme?: Theme
  notifyDaily?: boolean
  notifyWeekly?: boolean
  notifyAiTips?: boolean
}

export function useUpdateMe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateMePayload) => api.patch<UserDto>('/users/me', payload),
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.me, user)
      qc.invalidateQueries({ queryKey: queryKeys.dashboard })
      qc.invalidateQueries({ queryKey: ['nutrition'] })
    },
  })
}
