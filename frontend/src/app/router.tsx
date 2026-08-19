import { Navigate, Route, Routes } from "react-router-dom";

import { RequireAuth, RequireAuthOnly, RequireGuest } from "@/app/providers/route-guards";

import { AuthCallbackPage } from "@/pages/auth-callback/auth-callback-page";
import { CalculatorRoute } from "@/pages/calculator/registry";
import { ChatPage } from "@/pages/chat/chat-page";
import { DashboardPage } from "@/pages/dashboard/dashboard-page";
import { LandingPage } from "@/pages/landing/landing-page";
import { LoginPage } from "@/pages/login/login-page";
import { MealsPage } from "@/pages/meals/meals-page";
import { OAuthConsentPage } from "@/pages/oauth-consent/oauth-consent-page";
import { OnboardingPage } from "@/pages/onboarding/onboarding-page";
import { ProfilePage } from "@/pages/profile/profile-page";
import { ProgressPage } from "@/pages/progress/progress-page";
import { SettingsPage } from "@/pages/settings/settings-page";

import { AppShell } from "@/widgets/app-shell/app-shell";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
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
      <Route path="/calculators/:slug" element={<CalculatorRoute />} />
      <Route path="/oauth/consent/:uid" element={<OAuthConsentPage />} />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:conversationId" element={<ChatPage />} />
        <Route path="/meals" element={<MealsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
