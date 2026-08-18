import { AdminRouter } from "@/app/admin-router";

import { AdminAuthProvider } from "@/shared/rbac/admin-auth-context";
import { AdminThemeProvider } from "@/shared/theme/admin-theme-provider";
import "@/shared/theme/admin-theme.css";

/**
 * Root of the admin app — a standalone Vite deployment, separate from the
 * main NutriAI frontend. QueryClientProvider/I18nProvider/BrowserRouter are
 * set up in `main.tsx`; only admin-specific theme + auth state live here.
 */
export default function AdminApp() {
  return (
    <AdminThemeProvider>
      <AdminAuthProvider>
        <AdminRouter />
      </AdminAuthProvider>
    </AdminThemeProvider>
  );
}
