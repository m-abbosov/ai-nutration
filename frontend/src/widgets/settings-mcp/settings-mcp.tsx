import { useState } from "react";

import { env } from "@nutriai/shared/config/env";
import { useTranslation } from "@nutriai/shared/i18n";
import { Check, Copy } from "lucide-react";

import { Button } from "@/shared/ui/button";

const MCP_URL = `${env.apiUrl.replace(/\/api\/?$/, "")}/mcp`;

export function SettingsMcp() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(MCP_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="mt-6 pb-[11px] font-mono text-[9.5px] tracking-[.16em] text-tx3">{t.app.mcpSettingsTitle}</div>
      <div className="rounded-[18px] border border-line bg-surf p-[18px]">
        <p className="m-0 text-[12.5px] leading-[1.55] text-tx2">{t.app.mcpSettingsSub}</p>

        <div className="mt-4">
          <div className="text-[11px] font-medium text-tx3">{t.app.mcpSettingsUrlLabel}</div>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-line bg-surf2 px-3 py-2 font-mono text-[12.5px]">{MCP_URL}</code>
            <Button type="button" variant="secondary" size="sm" onClick={copy} className="flex-none gap-1.5">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? t.app.mcpSettingsCopied : t.app.mcpSettingsCopy}
            </Button>
          </div>
        </div>

        <ol className="m-0 mt-4 flex list-decimal flex-col gap-1.5 pl-4 text-[12.5px] leading-[1.55] text-tx2">
          <li>{t.app.mcpSettingsStep1}</li>
          <li>{t.app.mcpSettingsStep2}</li>
          <li>{t.app.mcpSettingsStep3}</li>
        </ol>
      </div>
    </>
  );
}
