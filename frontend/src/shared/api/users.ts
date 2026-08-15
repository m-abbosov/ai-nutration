import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/query-client'
import type { ActivityLevel, AiProvider, Gender, Goal, Language, Theme, UserDto } from '@/shared/api/types'

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

export interface SetAiKeyPayload {
  provider: AiProvider
  apiKey: string
}

/** Saves the user's own AI provider API key (BYOK) — the backend live-tests
 * it against the provider before storing, so a failed mutation here means
 * the key itself was rejected, not a network hiccup. */
export function useSetAiKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: SetAiKeyPayload) => api.post<UserDto>('/users/me/ai-key', payload),
    onSuccess: (user) => qc.setQueryData(queryKeys.me, user),
  })
}

export function useRemoveAiKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete<UserDto>('/users/me/ai-key'),
    onSuccess: (user) => qc.setQueryData(queryKeys.me, user),
  })
}
