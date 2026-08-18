import type { ReactNode } from "react";

import { Navigate } from "react-router-dom";

import type { AdminPermissionKey } from "@/shared/api/types";
import { useAdminTranslation } from "@/shared/i18n/use-admin-translation";
import { useAdminAuth, usePermission } from "@/shared/rbac/admin-auth-context";
import { AdminFullscreenSpinner } from "@/shared/ui/admin-fullscreen-spinner";
import { AdminErrorState } from "@/shared/ui/error-state";

/** Wraps every route below `/login` and `/auth/callback`. */
export function RequireAdminAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAdminAuthenticated } = useAdminAuth();

  if (isLoading) return <AdminFullscreenSpinner />;
  if (!isAdminAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Login page: bounce an already-authenticated admin onward. */
export function RequireAdminGuest({ children }: { children: ReactNode }) {
  const { isLoading, isAdminAuthenticated } = useAdminAuth();

  if (isLoading) return <AdminFullscreenSpinner />;
  if (isAdminAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** Gates a whole page behind a permission — shown instead of the page body
 * when the signed-in admin's role lacks it (defense in depth; the backend
 * is the real boundary, this just avoids a confusing blank/broken page). */
export function RequirePagePermission({ permission, children }: { permission: AdminPermissionKey; children: ReactNode }) {
  const allowed = usePermission(permission);
  const { t } = useAdminTranslation();
  if (!allowed) {
    return (
      <div className="p-6">
        <AdminErrorState message={t.errors.missingPermission} />
      </div>
    );
  }
  return <>{children}</>;
}
