import { useState } from "react";

import { ApiError } from "@nutriai/shared/api/client";
import type { AiProvider, UserDto } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";

import { useRemoveAiKey, useSetAiKey } from "@/shared/api/users";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

const PROVIDERS: AiProvider[] = ["GEMINI", "OPENAI", "CLAUDE"];

export function SettingsAi({ user }: { user: UserDto }) {
  const { t } = useTranslation();
  const setAiKey = useSetAiKey();
  const removeAiKey = useRemoveAiKey();
  const [provider, setProvider] = useState<AiProvider>(user.aiProvider ?? "GEMINI");
  const [apiKey, setApiKey] = useState("");

  const configured = !!user.aiProvider;
  const statusBadge = user.aiKeyStatus
    ? {
        label: t.aiKeyStatusLabel[user.aiKeyStatus],
        tone: user.aiKeyStatus === "OK" ? "ok" : ("bad" as const),
      }
    : { label: t.app.aiNotConfigured, tone: "bad" as const };

  const submit = () => {
    if (!apiKey.trim()) return;
    setAiKey.mutate({ provider, apiKey: apiKey.trim() }, { onSuccess: () => setApiKey("") });
  };

  const errorMessage = setAiKey.isError ? (setAiKey.error instanceof ApiError ? setAiKey.error.message : t.app.error) : null;

  return (
    <>
      <div className="mt-6 pb-[11px] font-mono text-[9.5px] tracking-[.16em] text-tx3">{t.stAI}</div>
      <div className="relative overflow-hidden rounded-[18px] border border-line bg-surf p-[18px]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(80% 120% at 100% 0, var(--accT), transparent 60%)" }}
        />
        <div className="relative flex flex-wrap items-center gap-3.5">
          <div className="relative h-9 w-9 flex-none">
            <div className="absolute -inset-1 animate-halo rounded-full blur-[8px]" style={{ background: "var(--accG)" }} />
            <div
              className="relative h-9 w-9 rounded-full"
              style={{
                background: "radial-gradient(circle at 32% 28%, var(--acc), var(--accD) 60%, var(--surf2))",
                boxShadow: "inset 0 0 8px rgba(255,255,255,.28)",
              }}
            />
          </div>
          <div className="min-w-[180px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13.5px] font-semibold">{configured ? t.aiProviderLabel[user.aiProvider!] : t.stGem}</span>
              <span
                className={
                  statusBadge.tone === "ok"
                    ? "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accT px-2.5 py-[3px] text-[10.5px] text-acc"
                    : "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-fatT px-2.5 py-[3px] text-[10.5px] text-fat"
                }
              >
                <span className={statusBadge.tone === "ok" ? "h-1 w-1 animate-pulse-soft rounded-full bg-acc" : "h-1 w-1 rounded-full bg-fat"} />
                {statusBadge.label}
              </span>
            </div>
            <div className="mt-[3px] text-[12px] text-tx3">{t.app.aiSettingsSub}</div>
            {user.aiKeyLast4 && <div className="mt-1 font-mono text-[11px] text-tx3">•••• {user.aiKeyLast4}</div>}
          </div>
          {configured && (
            <Button type="button" variant="secondary" size="sm" onClick={() => removeAiKey.mutate()} disabled={removeAiKey.isPending}>
              {t.app.aiRemoveKey}
            </Button>
          )}
        </div>

        <div className="relative mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 sm:max-w-[180px]">
            <Label htmlFor="ai-provider">{t.app.aiApiKeyLabel}</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as AiProvider)}>
              <SelectTrigger id="ai-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {t.aiProviderLabel[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0 flex-1">
            <Input
              id="ai-key"
              type="password"
              autoComplete="off"
              placeholder={t.app.aiApiKeyPh}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <Button type="button" onClick={submit} disabled={!apiKey.trim() || setAiKey.isPending}>
            {t.app.aiSaveKey}
          </Button>
        </div>
        {errorMessage && <p className="relative mt-2 text-[12px] text-fat">{errorMessage}</p>}
      </div>
    </>
  );
}
