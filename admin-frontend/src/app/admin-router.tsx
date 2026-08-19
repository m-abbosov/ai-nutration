import { Suspense, lazy } from "react";

import { Route, Routes } from "react-router-dom";

import { AdminShell } from "@/app/admin-shell";

import { RequireAdminAuth, RequireAdminGuest, RequirePagePermission } from "@/shared/rbac/route-guards";
import { AdminFullscreenSpinner } from "@/shared/ui/admin-fullscreen-spinner";

const LoginPage = lazy(() => import("@/pages/login/login-page").then((m) => ({ default: m.AdminLoginPage })));
const AuthCallbackPage = lazy(() => import("@/pages/auth-callback/auth-callback-page").then((m) => ({ default: m.AdminAuthCallbackPage })));
const DashboardPage = lazy(() => import("@/pages/dashboard/dashboard-page").then((m) => ({ default: m.DashboardPage })));
const UsersPage = lazy(() => import("@/pages/users/users-page").then((m) => ({ default: m.UsersPage })));
const UserDetailPage = lazy(() => import("@/pages/users/user-detail-page").then((m) => ({ default: m.UserDetailPage })));
const NutritionPage = lazy(() => import("@/pages/nutrition/nutrition-page").then((m) => ({ default: m.NutritionPage })));
const AiPage = lazy(() => import("@/pages/ai/ai-page").then((m) => ({ default: m.AiPage })));
const CalculatorsPage = lazy(() => import("@/pages/calculators/calculators-page").then((m) => ({ default: m.CalculatorsPage })));
const ConversationsPage = lazy(() => import("@/pages/conversations/conversations-page").then((m) => ({ default: m.ConversationsPage })));
const ConversationDetailPage = lazy(() =>
  import("@/pages/conversations/conversation-detail-page").then((m) => ({ default: m.ConversationDetailPage })),
);
const AnalyticsPage = lazy(() => import("@/pages/analytics/analytics-page").then((m) => ({ default: m.AnalyticsPage })));
const SystemPage = lazy(() => import("@/pages/system/system-page").then((m) => ({ default: m.SystemPage })));
const SystemLogsPage = lazy(() => import("@/pages/system/system-logs-page").then((m) => ({ default: m.SystemLogsPage })));
const AdminUsersPage = lazy(() => import("@/pages/admin-users/admin-users-page").then((m) => ({ default: m.AdminUsersPage })));
const AdminUserDetailPage = lazy(() => import("@/pages/admin-users/admin-user-detail-page").then((m) => ({ default: m.AdminUserDetailPage })));
const SettingsPage = lazy(() => import("@/pages/settings/settings-page").then((m) => ({ default: m.SettingsPage })));

export function AdminRouter() {
  return (
    <Suspense fallback={<AdminFullscreenSpinner />}>
      <Routes>
        <Route
          path="login"
          element={
            <RequireAdminGuest>
              <LoginPage />
            </RequireAdminGuest>
          }
        />
        <Route path="auth/callback" element={<AuthCallbackPage />} />

        <Route
          element={
            <RequireAdminAuth>
              <AdminShell />
            </RequireAdminAuth>
          }
        >
          <Route
            index
            element={
              <RequirePagePermission permission="DASHBOARD_READ">
                <DashboardPage />
              </RequirePagePermission>
            }
          />
          <Route
            path="users"
            element={
              <RequirePagePermission permission="USERS_READ">
                <UsersPage />
              </RequirePagePermission>
            }
          />
          <Route
            path="users/:id"
            element={
              <RequirePagePermission permission="USERS_READ">
                <UserDetailPage />
              </RequirePagePermission>
            }
          />
          <Route
            path="nutrition"
            element={
              <RequirePagePermission permission="NUTRITION_READ">
                <NutritionPage />
              </RequirePagePermission>
            }
          />
          <Route
            path="ai"
            element={
              <RequirePagePermission permission="AI_READ">
                <AiPage />
              </RequirePagePermission>
            }
          />
          <Route
            path="ai/requests/:id"
            element={
              <RequirePagePermission permission="AI_READ">
                <AiPage />
              </RequirePagePermission>
            }
          />
          <Route
            path="calculators"
            element={
              <RequirePagePermission permission="ANALYTICS_READ">
                <CalculatorsPage />
              </RequirePagePermission>
            }
          />
          {/* Conversations LIST needs no specific permission per
              docs/ADMIN_API_CONTRACT.md ("CONVERSATIONS_READ is not required
              for this list — only for the detail route below") — any admin
              can see metadata; content access is gated inside the page. */}
          <Route path="conversations" element={<ConversationsPage />} />
          <Route
            path="conversations/:id"
            element={
              <RequirePagePermission permission="CONVERSATIONS_READ">
                <ConversationDetailPage />
              </RequirePagePermission>
            }
          />
          <Route
            path="analytics"
            element={
              <RequirePagePermission permission="ANALYTICS_READ">
                <AnalyticsPage />
              </RequirePagePermission>
            }
          />
          <Route
            path="system"
            element={
              <RequirePagePermission permission="SYSTEM_READ">
                <SystemPage />
              </RequirePagePermission>
            }
          />
          <Route
            path="system/logs"
            element={
              <RequirePagePermission permission="SYSTEM_READ">
                <SystemLogsPage />
              </RequirePagePermission>
            }
          />
          <Route
            path="admin-users"
            element={
              <RequirePagePermission permission="ADMIN_USERS_READ">
                <AdminUsersPage />
              </RequirePagePermission>
            }
          />
          <Route
            path="admin-users/:id"
            element={
              <RequirePagePermission permission="ADMIN_USERS_READ">
                <AdminUserDetailPage />
              </RequirePagePermission>
            }
          />
          <Route
            path="settings"
            element={
              <RequirePagePermission permission="SETTINGS_MANAGE">
                <SettingsPage />
              </RequirePagePermission>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
