import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth, RequireAuthOnly, RequireGuest } from '@/app/providers/route-guards'
import { AppShell } from '@/widgets/app-shell/app-shell'
import { LoginPage } from '@/pages/login/login-page'
import { AuthCallbackPage } from '@/pages/auth-callback/auth-callback-page'
import { OnboardingPage } from '@/pages/onboarding/onboarding-page'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'
import { ChatPage } from '@/pages/chat/chat-page'
import { MealsPage } from '@/pages/meals/meals-page'
import { ProgressPage } from '@/pages/progress/progress-page'
import { ProfilePage } from '@/pages/profile/profile-page'
import { SettingsPage } from '@/pages/settings/settings-page'
import { FullscreenSpinner } from '@/shared/ui/fullscreen-spinner'

// Admin Panel (Phase 2) — an entirely separate, code-split subtree. Lazy
// so its JS/CSS/design tokens never ship in the bundle a regular user
// downloads at `/`, `/chat`, etc. See docs/ADMIN_PANEL.md.
const AdminApp = lazy(() => import('@/admin/app/admin-app'))

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RequireGuest>
            <LoginPage />
          </RequireGuest>
        }
      />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route
        path="/onboarding"
        element={
          <RequireAuthOnly>
            <OnboardingPage />
          </RequireAuthOnly>
        }
      />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:conversationId" element={<ChatPage />} />
        <Route path="/meals" element={<MealsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<FullscreenSpinner />}>
            <AdminApp />
          </Suspense>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
