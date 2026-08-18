import type { ReactNode } from "react";

import { Navigate } from "react-router-dom";

import { useAuth } from "@/app/providers/auth-provider";

import { FullscreenSpinner } from "@/shared/ui/fullscreen-spinner";

/** Requires a signed-in, onboarded user. Redirects to /login or /onboarding otherwise. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isOnboarded, isLoading } = useAuth();

  if (isLoading) return <FullscreenSpinner />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

/** Requires a signed-in user but does not require onboarding (the onboarding page itself). */
export function RequireAuthOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated, isOnboarded, isLoading } = useAuth();

  if (isLoading) return <FullscreenSpinner />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (isOnboarded) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/** Public landing (/) and login page: bounce already-authenticated users onward. */
export function RequireGuest({ children }: { children: ReactNode }) {
  const { isAuthenticated, isOnboarded, isLoading } = useAuth();

  if (isLoading) return <FullscreenSpinner />;
  if (isAuthenticated) return <Navigate to={isOnboarded ? "/dashboard" : "/onboarding"} replace />;
  return <>{children}</>;
}
