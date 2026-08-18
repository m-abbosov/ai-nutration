import { queryClient } from "@nutriai/shared/api/query-client";
import { I18nProvider } from "@nutriai/shared/i18n";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "@/app/providers/auth-provider";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { AppRouter } from "@/app/router";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <I18nProvider>
          <ThemeProvider>
            <BrowserRouter>
              <AuthProvider>
                <AppRouter />
              </AuthProvider>
            </BrowserRouter>
          </ThemeProvider>
        </I18nProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}
