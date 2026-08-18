import { StrictMode } from "react";

import "@/styles/index.css";
import { queryClient } from "@nutriai/shared/api/query-client";
import { I18nProvider } from "@nutriai/shared/i18n";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import AdminApp from "@/app/admin-app";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <BrowserRouter>
          <AdminApp />
        </BrowserRouter>
      </I18nProvider>
    </QueryClientProvider>
  </StrictMode>,
);
