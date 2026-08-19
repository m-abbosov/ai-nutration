import { useEffect, useRef } from "react";

import { tokenStorage } from "@nutriai/shared/api/token-storage";
import { env } from "@nutriai/shared/config/env";
import { useTranslation } from "@nutriai/shared/i18n";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { useAuth } from "@/app/providers/auth-provider";

import { Button } from "@/shared/ui/button";
import { FullscreenSpinner } from "@/shared/ui/fullscreen-spinner";
import { LogoMark } from "@/shared/ui/nav-icons";

const INTERACTION_BASE = `${env.apiUrl}/mcp-oauth/interaction`;

/**
 * Where oidc-provider's MCP OAuth flow sends the browser (via
 * backend/src/mcp-oauth/mcp-oauth-interaction.controller.ts's `view`
 * redirect) to resolve the "login" and "consent" prompts. Reuses the
 * existing NutriAI session — no separate account for connecting Claude/
 * ChatGPT — the whole point is that the user's own AI subscription is used,
 * never a shared API key billed to us.
 *
 * Every step here is a real top-level navigation — a `<form method="POST">`
 * submit, never `fetch()` — because the oidc-provider interaction cookie
 * lives on the *backend's* origin, and a cross-origin `fetch()` to read or
 * spend it gets silently blocked by third-party-cookie restrictions in real
 * browsers (Safari ITP, Chrome's phase-out) even with `SameSite=None` — see
 * the interaction controller's doc comment for the production incident
 * that surfaced this.
 */
export function OAuthConsentPage() {
  const { uid } = useParams<{ uid?: string }>();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const loginFormRef = useRef<HTMLFormElement>(null);
  const autoSubmitted = useRef(false);

  const prompt = searchParams.get("prompt");
  const clientName = searchParams.get("client");
  const error = searchParams.get("error") === "1" || !uid || !prompt;
  const accessToken = tokenStorage.getAccessToken();

  const needsLogin = prompt === "login" && !authLoading && !isAuthenticated;
  const autoLogin = prompt === "login" && isAuthenticated && !!accessToken;

  useEffect(() => {
    if (autoLogin && !autoSubmitted.current) {
      autoSubmitted.current = true;
      loginFormRef.current?.submit();
    }
  }, [autoLogin]);

  const submitDecision = (action: "confirm" | "deny") => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${INTERACTION_BASE}/${uid}/${action}`;
    form.style.display = "none";
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "accessToken";
    input.value = accessToken ?? "";
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  };

  const showSpinner = authLoading || autoLogin;

  // The hidden auto-submit form must stay mounted even while the spinner is
  // showing — the effect above submits it via the ref, and an early return
  // that swaps out the whole tree (as this used to do) unmounts it first,
  // so the ref is null right when it's needed.
  const loginForm = prompt === "login" && (
    <form ref={loginFormRef} method="POST" action={`${INTERACTION_BASE}/${uid}/login`} className="hidden">
      <input type="hidden" name="accessToken" value={accessToken ?? ""} />
    </form>
  );

  if (showSpinner) {
    return (
      <>
        <FullscreenSpinner />
        {loginForm}
      </>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-5">
      <div className="w-full max-w-[420px] rounded-[20px] border border-line2 bg-surf2 p-7 shadow-card">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-[-.015em]">
            Nutri<span className="text-acc">AI</span>
          </span>
        </div>

        {error && <p className="mt-6 text-[13.5px] leading-[1.55] text-tx2">{t.app.mcpConsentError}</p>}

        {!error && needsLogin && (
          <>
            <p className="mt-6 text-[13.5px] leading-[1.55] text-tx2">{t.app.mcpConsentNeedLogin}</p>
            <Button asChild className="mt-5 w-full">
              <Link to="/login">{t.app.mcpConsentSignIn}</Link>
            </Button>
          </>
        )}

        {!error && prompt === "consent" && (
          <>
            <h1 className="m-0 mt-6 text-[18px] font-medium leading-tight tracking-[-.015em]">{t.app.mcpConsentTitle(clientName ?? "")}</h1>
            <p className="m-0 mt-2.5 text-[13px] leading-[1.55] text-tx2">{t.app.mcpConsentBody}</p>
            <div className="mt-6 flex gap-2.5">
              <Button variant="secondary" className="flex-1" onClick={() => submitDecision("deny")}>
                {t.app.mcpConsentDeny}
              </Button>
              <Button className="flex-1" onClick={() => submitDecision("confirm")}>
                {t.app.mcpConsentAllow}
              </Button>
            </div>
          </>
        )}

        {loginForm}
      </div>
    </div>
  );
}
