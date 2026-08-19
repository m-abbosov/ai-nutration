import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type AdminTheme = "light" | "dark";

const STORAGE_KEY = "nutriai.admin.theme";

function readStoredTheme(): AdminTheme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

interface AdminThemeContextValue {
  theme: AdminTheme;
  toggleTheme: () => void;
  setTheme: (theme: AdminTheme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

/**
 * Scoped theme state for the admin subtree only. Deliberately does NOT touch
 * `document.documentElement.dataset.theme` (that's the Phase 1 user-app
 * theme switch, and this is a wholly separate deployment/bundle from that
 * app, so there's no real bleed risk) — but it DOES stamp `data-admin-theme`
 * on `<html>` in addition to the `.admin-root` wrapper: Radix's Dialog/
 * Popover/Select all portal their content straight to `document.body`,
 * outside `.admin-root`'s DOM subtree, so `--adm-*` tokens (see
 * admin-theme.css, defined on `:root` + `.admin-root`) would otherwise be
 * unresolved for anything portaled — the exact cause of the transparent-
 * modal bug this was fixing.
 */
export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>(readStoredTheme);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.dataset.adminTheme = theme;
    return () => {
      delete document.documentElement.dataset.adminTheme;
    };
  }, [theme]);

  const setTheme = useCallback((next: AdminTheme) => setThemeState(next), []);
  const toggleTheme = useCallback(() => setThemeState((prev) => (prev === "dark" ? "light" : "dark")), []);

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div className="admin-root" data-admin-theme={theme}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error("useAdminTheme must be used within AdminThemeProvider");
  return ctx;
}
