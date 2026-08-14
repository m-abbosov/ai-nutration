import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { queryClient } from '@/shared/api/query-client'
import { I18nProvider } from '@/shared/i18n'
import { ThemeProvider } from '@/app/providers/theme-provider'
import { AuthProvider } from '@/app/providers/auth-provider'
import { AppRouter } from '@/app/router'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AuthProvider>
              <AppRouter />
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  )
}
