import { useState } from "react";

import { useLogout } from "@nutriai/shared/api/auth";
import type { Language } from "@nutriai/shared/api/types";
import { langName, useTranslation } from "@nutriai/shared/i18n";
import { cn } from "@nutriai/shared/lib/cn";
import {
  Activity,
  Apple,
  BarChart3,
  Calculator,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  Moon,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import type { AdminPermissionKey } from "@/shared/api/types";
import { useAdminTranslation } from "@/shared/i18n/use-admin-translation";
import { useAdminAuth } from "@/shared/rbac/admin-auth-context";
import { useAdminTheme } from "@/shared/theme/admin-theme-provider";
import { AdminSelect, AdminSelectContent, AdminSelectItem, AdminSelectTrigger, AdminSelectValue } from "@/shared/ui/select";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: AdminPermissionKey;
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar trigger */}
      <div
        className="flex items-center justify-between border-b px-4 py-3 md:hidden"
        style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}
      >
        <Logo />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-[var(--adm-radius-sm)]"
          style={{ color: "var(--adm-text-2)" }}
          aria-label="Open menu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0" style={{ background: "var(--adm-overlay)" }} onClick={() => setMobileOpen(false)} />
          <div
            className="absolute left-0 top-0 h-full w-[260px] border-r p-3"
            style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}
          >
            <div className="flex items-center justify-between px-1 py-1">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-[var(--adm-radius-sm)]"
                style={{ color: "var(--adm-text-3)" }}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarBody collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn("hidden flex-none flex-col border-r transition-[width] duration-150 md:flex", collapsed ? "w-[64px]" : "w-[224px]")}
        style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}
      >
        <div className={cn("flex items-center px-3 py-4", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && <Logo />}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex h-7 w-7 flex-none items-center justify-center rounded-[var(--adm-radius-sm)]"
            style={{ color: "var(--adm-text-3)" }}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        </div>
        <SidebarBody collapsed={collapsed} />
      </aside>
    </>
  );
}

function Logo() {
  const { t } = useAdminTranslation();
  return (
    <div className="flex items-center gap-2">
      <span
        className="flex h-6 w-6 flex-none items-center justify-center rounded-[var(--adm-radius-sm)] text-[11px] font-bold"
        style={{ background: "var(--adm-accent)", color: "var(--adm-text-on-accent)" }}
      >
        N
      </span>
      <span className="text-[13px] font-semibold tracking-tight" style={{ color: "var(--adm-text)" }}>
        NutriAI <span style={{ color: "var(--adm-text-3)" }}>{t.nav.tagline}</span>
      </span>
    </div>
  );
}

function SidebarBody({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { t } = useAdminTranslation();
  const { admin } = useAdminAuth();

  const items: NavItem[] = [
    { to: "/", label: t.common.dashboard, icon: LayoutDashboard, permission: "DASHBOARD_READ" },
    { to: "/users", label: t.common.users, icon: Users, permission: "USERS_READ" },
    { to: "/nutrition", label: t.common.nutrition, icon: Apple, permission: "NUTRITION_READ" },
    { to: "/ai", label: t.common.ai, icon: Sparkles, permission: "AI_READ" },
    { to: "/calculators", label: t.common.calculators, icon: Calculator, permission: "ANALYTICS_READ" },
    { to: "/conversations", label: t.common.conversations, icon: MessagesSquare },
    { to: "/analytics", label: t.common.analytics, icon: BarChart3, permission: "ANALYTICS_READ" },
    { to: "/system", label: t.common.system, icon: Activity, permission: "SYSTEM_READ" },
    { to: "/admin-users", label: t.common.adminUsers, icon: ShieldCheck, permission: "ADMIN_USERS_READ" },
    { to: "/settings", label: t.common.settings, icon: SettingsIcon, permission: "SETTINGS_MANAGE" },
  ];

  const visible = items.filter((item) => !item.permission || admin?.role.permissions.includes(item.permission));

  return (
    <div className="flex flex-1 flex-col justify-between overflow-y-auto px-2 pb-3">
      <nav className="flex flex-col gap-0.5">
        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-[var(--adm-radius-sm)] px-2.5 py-2 text-[12.5px] font-medium transition-colors",
              collapsed && "justify-center px-0",
            )}
            style={({ isActive }) => ({
              background: isActive ? "var(--adm-accent-subtle)" : "transparent",
              color: isActive ? "var(--adm-accent)" : "var(--adm-text-2)",
            })}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-4 w-4 flex-none" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <SidebarFooter collapsed={collapsed} />
    </div>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { admin } = useAdminAuth();
  const { theme, toggleTheme } = useAdminTheme();
  const { lang, setLang } = useTranslation();
  const { t } = useAdminTranslation();
  const logout = useLogout();

  return (
    <div className="mt-3 flex flex-col gap-2 border-t pt-3" style={{ borderColor: "var(--adm-border)" }}>
      <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-7 w-7 flex-none items-center justify-center rounded-[var(--adm-radius-sm)]"
          style={{ color: "var(--adm-text-2)", background: "var(--adm-bg-inset)" }}
          aria-label={t.common.toggleTheme}
          title={t.common.toggleTheme}
        >
          {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>
        {!collapsed && (
          <AdminSelect value={lang} onValueChange={(v) => setLang(v as Language)}>
            <AdminSelectTrigger className="h-7 flex-1 text-[11.5px]">
              <AdminSelectValue />
            </AdminSelectTrigger>
            <AdminSelectContent>
              {(["UZ", "RU", "EN"] as Language[]).map((l) => (
                <AdminSelectItem key={l} value={l}>
                  {langName[l]}
                </AdminSelectItem>
              ))}
            </AdminSelectContent>
          </AdminSelect>
        )}
      </div>

      {!collapsed && admin && (
        <div className="flex items-center gap-2 px-1">
          {admin.avatarUrl ? (
            <img src={admin.avatarUrl} alt="" className="h-6 w-6 flex-none rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <span
              className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-[10px] font-semibold"
              style={{ background: "var(--adm-accent-subtle)", color: "var(--adm-accent)" }}
            >
              {admin.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium" style={{ color: "var(--adm-text)" }}>
              {admin.name}
            </div>
            <div className="truncate text-[10.5px]" style={{ color: "var(--adm-text-3)" }}>
              {admin.role.name}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => logout.mutate()}
        className={cn(
          "flex items-center gap-2 rounded-[var(--adm-radius-sm)] px-2.5 py-1.5 text-[12px] font-medium transition-colors",
          collapsed && "justify-center px-0",
        )}
        style={{ color: "var(--adm-text-2)" }}
        title={t.common.logout}
      >
        <LogOut className="h-3.5 w-3.5" />
        {!collapsed && <span>{t.common.logout}</span>}
      </button>
    </div>
  );
}
