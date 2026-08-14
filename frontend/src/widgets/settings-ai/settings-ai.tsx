import { useTranslation } from '@/shared/i18n'
import { useGeminiHealth } from '@/shared/api/health'
import { Skeleton } from '@/shared/ui/skeleton'

/** Read-only Gemini connection badge. Per DESIGN_MAPPING.md the "Replace key"
 * control from the mock is intentionally dropped — the key is a server-only
 * env var, never sent to or editable from the client. */
export function SettingsAi() {
  const { t } = useTranslation()
  const { data, isLoading } = useGeminiHealth()

  return (
    <>
      <div className="mt-6 pb-[11px] font-mono text-[9.5px] tracking-[.16em] text-tx3">{t.stAI}</div>
      <div className="relative overflow-hidden rounded-[18px] border border-line bg-surf p-[18px]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(80% 120% at 100% 0, var(--accT), transparent 60%)' }}
        />
        <div className="relative flex flex-wrap items-center gap-3.5">
          <div className="relative h-9 w-9 flex-none">
            <div className="absolute -inset-1 animate-halo rounded-full blur-[8px]" style={{ background: 'var(--accG)' }} />
            <div
              className="relative h-9 w-9 rounded-full"
              style={{
                background: 'radial-gradient(circle at 32% 28%, var(--acc), var(--accD) 60%, var(--surf2))',
                boxShadow: 'inset 0 0 8px rgba(255,255,255,.28)',
              }}
            />
          </div>
          <div className="min-w-[180px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13.5px] font-semibold">{t.stGem}</span>
              {isLoading ? (
                <Skeleton className="h-5 w-20 rounded-full" />
              ) : data?.connected ? (
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accT px-2.5 py-[3px] text-[10.5px] text-acc">
                  <span className="h-1 w-1 animate-pulse-soft rounded-full bg-acc" />
                  {t.stConn}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-fatT px-2.5 py-[3px] text-[10.5px] text-fat">
                  <span className="h-1 w-1 rounded-full bg-fat" />
                  {t.stDisconnected}
                </span>
              )}
            </div>
            <div className="mt-[3px] text-[12px] text-tx3">{t.stGemSub}</div>
          </div>
        </div>
      </div>
    </>
  )
}
