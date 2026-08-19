import { useEffect, useRef, useState } from "react";

import { ApiError, api } from "@nutriai/shared/api/client";
import { useTranslation } from "@nutriai/shared/i18n";
import { Link, useParams } from "react-router-dom";

import { useAuth } from "@/app/providers/auth-provider";

import { Button } from "@/shared/ui/button";
import { FullscreenSpinner } from "@/shared/ui/fullscreen-spinner";
import { LogoMark } from "@/shared/ui/nav-icons";

interface InteractionDetailsDto {
  uid: string;
  prompt: string;
  clientId: string | null;
  clientName: string | null;
}

interface RedirectDto {
  redirectTo: string;
}

type ViewState = "loading" | "need-login" | "consent" | "redirecting" | "error";

/**
 * Where oidc-provider's MCP OAuth flow sends the browser to resolve the
 * "login" and "consent" prompts (see backend/src/mcp-oauth/). Reuses the
 * existing NutriAI session — no separate account for connecting Claude/
 * ChatGPT — the whole point is that the user's own AI subscription is used,
 * never a shared API key billed to us.
 */
export function OAuthConsentPage() {
  const { uid = "" } = useParams<{ uid: string }>();
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<ViewState>("loading");
  const [clientName, setClientName] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (authLoading || ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const details = await api.get<InteractionDetailsDto>(`/mcp-oauth/interaction/${uid}`, { credentials: "include" });
        setClientName(details.clientName);

        if (details.prompt === "login") {
          if (!isAuthenticated) {
            setState("need-login");
            return;
          }
          setState("redirecting");
          const { redirectTo } = await api.post<RedirectDto>(`/mcp-oauth/interaction/${uid}/login`, undefined, { credentials: "include" });
          window.location.href = redirectTo;
          return;
        }

        if (details.prompt === "consent") {
          setState("consent");
          return;
        }

        setState("error");
      } catch {
        setState("error");
      }
    })();
  }, [authLoading, isAuthenticated, uid]);

  const respond = async (path: "confirm" | "deny") => {
    setState("redirecting");
    try {
      const { redirectTo } = await api.post<RedirectDto>(`/mcp-oauth/interaction/${uid}/${path}`, undefined, { credentials: "include" });
      window.location.href = redirectTo;
    } catch (err) {
      setState("error");
      if (err instanceof ApiError) {
        console.error(err.message);
      }
    }
  };

  if (state === "loading" || state === "redirecting") return <FullscreenSpinner />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-5">
      <div className="w-full max-w-[420px] rounded-[20px] border border-line2 bg-surf2 p-7 shadow-card">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-[-.015em]">
            Nutri<span className="text-acc">AI</span>
          </span>
        </div>

        {state === "error" && <p className="mt-6 text-[13.5px] leading-[1.55] text-tx2">{t.app.mcpConsentError}</p>}

        {state === "need-login" && (
          <>
            <p className="mt-6 text-[13.5px] leading-[1.55] text-tx2">{t.app.mcpConsentNeedLogin}</p>
            <Button asChild className="mt-5 w-full">
              <Link to="/login">{t.app.mcpConsentSignIn}</Link>
            </Button>
          </>
        )}

        {state === "consent" && (
          <>
            <h1 className="m-0 mt-6 text-[18px] font-medium leading-tight tracking-[-.015em]">{t.app.mcpConsentTitle(clientName ?? "")}</h1>
            <p className="m-0 mt-2.5 text-[13px] leading-[1.55] text-tx2">{t.app.mcpConsentBody}</p>
            <div className="mt-6 flex gap-2.5">
              <Button variant="secondary" className="flex-1" onClick={() => respond("deny")}>
                {t.app.mcpConsentDeny}
              </Button>
              <Button className="flex-1" onClick={() => respond("confirm")}>
                {t.app.mcpConsentAllow}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
