import '@/admin/shared/theme/admin-theme.css'
import { AdminThemeProvider } from '@/admin/shared/theme/admin-theme-provider'
import { AdminAuthProvider } from '@/admin/shared/rbac/admin-auth-context'
import { AdminRouter } from '@/admin/app/admin-router'

/**
 * Entry point for the whole `/admin/*` subtree — mounted as a single
 * `React.lazy` chunk from `app/router.tsx`, so none of this (or its CSS)
 * ships in the bundle a regular user downloads at `/`, `/chat`, etc.
 *
 * Reuses the app-wide QueryClient/I18nProvider/BrowserRouter already set up
 * in `app/App.tsx` — only admin-specific theme + auth state live here.
 */
export default function AdminApp() {
  return (
    <AdminThemeProvider>
      <AdminAuthProvider>
        <AdminRouter />
      </AdminAuthProvider>
    </AdminThemeProvider>
  )
}
