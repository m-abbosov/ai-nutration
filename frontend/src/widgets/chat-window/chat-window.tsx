import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MoreHorizontal, ArrowUp, Menu, TriangleAlert } from 'lucide-react'
import { useTranslation } from '@nutriai/shared/i18n'
import { useAuth } from '@/app/providers/auth-provider'
import { useMessages, useSendMessage } from '@/shared/api/chat'
import { useCreateConversation } from '@/shared/api/chat'
import { NutritionResultCard } from '@/widgets/chat-window/nutrition-result-card'
import { RecommendationsCard } from '@/widgets/chat-window/recommendations-card'
import { MealEditSuggestionCard } from '@/widgets/chat-window/meal-edit-suggestion-card'
import { ErrorState } from '@/shared/ui/state-blocks'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@nutriai/shared/lib/cn'

const AiAvatar = ({ size = 28 }: { size?: number }) => (
  <div
    className="relative flex-none rounded-full"
    style={{
      width: size,
      height: size,
      background: 'radial-gradient(circle at 32% 28%, var(--acc), var(--accD) 62%, var(--surf2))',
      boxShadow: 'inset 0 0 6px rgba(255,255,255,.3)',
    }}
  />
)

export function ChatWindow({
  conversationId,
  onOpenHistory,
}: {
  conversationId?: string
  onOpenHistory?: () => void
}) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState('')
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  const { data: messages, isLoading, isError, refetch } = useMessages(conversationId)
  const sendMessage = useSendMessage()
  const createConversation = useCreateConversation()

  const aiConfigured = !!user?.aiProvider
  const aiWarning = user?.aiKeyStatus && user.aiKeyStatus !== 'OK' ? t.aiKeyStatusLabel[user.aiKeyStatus] : null

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, sendMessage.isPending])

  const submit = async (content: string) => {
    const text = content.trim()
    if (!text || sendMessage.isPending || !aiConfigured) return
    setDraft('')
    let targetId = conversationId
    if (!targetId) {
      const conv = await createConversation.mutateAsync()
      targetId = conv.id
      navigate(`/chat/${conv.id}`)
    }
    sendMessage.mutate({ conversationId: targetId, content: text })
  }

  const quickActions = [
    { emoji: '🍳', label: t.qa0, bg: 'bg-carbT' },
    { emoji: '🍲', label: t.qa1, bg: 'bg-accT' },
    { emoji: '🔥', label: t.qa2, bg: 'bg-fatT' },
    { emoji: '📊', label: t.qa3, bg: 'bg-proT' },
  ]
  const suggestions = [t.sugg1, t.sugg2, t.sugg3]

  const isEmpty = !conversationId || (messages && messages.length === 0)

  return (
    <div className="relative flex min-w-0 flex-1 flex-col">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[280px]"
        style={{ background: 'radial-gradient(90% 100% at 50% 0, var(--accT), transparent 70%)' }}
      />

      <div className="relative flex items-center gap-[11px] border-b border-line px-5 py-3.5 md:px-[26px]">
        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className="grid h-9 w-9 flex-none place-items-center rounded-[11px] border border-line text-tx2 lg:hidden"
          >
            <Menu className="h-[15px] w-[15px]" />
          </button>
        )}
        <AiAvatar size={30} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-semibold tracking-[-.01em]">{t.aiTitle}</div>
          <div className="flex items-center gap-1.5 truncate text-[11px] text-tx3">
            <span className="h-1 w-1 flex-none animate-pulse-soft rounded-full bg-acc" />
            {t.chatStatus}
          </div>
        </div>
        <button className="grid h-[30px] w-[30px] place-items-center rounded-[9px] text-tx3 transition-colors hover:bg-surf2 hover:text-tx">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-5 pb-2 pt-[26px] md:px-[26px]">
        {isEmpty && (
          <div className="mx-auto flex max-w-[600px] animate-fu flex-col items-center px-0 pb-5 pt-8 text-center">
            <div className="relative mb-6 h-[104px] w-[104px]">
              <div
                className="absolute -inset-4 animate-halo rounded-full blur-[18px]"
                style={{ background: 'radial-gradient(circle, var(--accG), transparent 66%)' }}
              />
              <svg viewBox="0 0 104 104" className="absolute inset-0 animate-spin-slow">
                <circle cx="52" cy="52" r="50" fill="none" stroke="var(--line2)" strokeWidth="1" strokeDasharray="3 7" />
              </svg>
              <div
                className="absolute inset-[14px] animate-drift rounded-full"
                style={{
                  background: 'radial-gradient(circle at 34% 26%, var(--acc), var(--accD) 55%, var(--surf) 96%)',
                  boxShadow: 'inset 0 0 18px rgba(255,255,255,.25), 0 8px 28px -8px var(--accG)',
                }}
              />
            </div>
            <h2 className="m-0 max-w-[19ch] text-pretty font-serif text-[26px] font-normal leading-[1.2] tracking-[-.01em] md:text-[31px]">
              {t.emptyTitle}
            </h2>
            <p className="m-0 mt-3 max-w-[44ch] text-pretty text-[13.5px] leading-[1.55] text-tx2">{t.emptySub}</p>
            <div className="mt-[30px] grid w-full grid-cols-[repeat(auto-fit,minmax(232px,1fr))] gap-2.5">
              {quickActions.map((qa) => (
                <button
                  key={qa.label}
                  onClick={() => submit(qa.label)}
                  disabled={!aiConfigured}
                  className="flex items-center gap-[11px] rounded-2xl border border-line bg-surf px-3.5 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-line2 hover:bg-surf2 disabled:pointer-events-none disabled:opacity-50"
                >
                  <span className={cn('grid h-[30px] w-[30px] flex-none place-items-center rounded-[10px] text-[14px]', qa.bg)}>
                    {qa.emoji}
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] font-medium">{qa.label}</span>
                  <span className="font-mono text-tx3">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mx-auto flex max-w-[700px] flex-col gap-4">
            <Skeleton className="h-16 w-2/3" />
            <Skeleton className="ml-auto h-10 w-1/2" />
            <Skeleton className="h-24 w-3/4" />
          </div>
        )}
        {isError && (
          <div className="mx-auto max-w-[700px]">
            <ErrorState onRetry={() => refetch()} />
          </div>
        )}

        {messages && messages.length > 0 && (
          <div className="mx-auto flex max-w-[700px] flex-col gap-[22px]">
            {messages.map((m) => (
              <div key={m.id} className="animate-fu">
                {m.role === 'USER' ? (
                  <div className="flex justify-end">
                    <div className="max-w-[70%] rounded-[17px_17px_5px_17px] border border-line2 bg-accT px-[15px] py-[11px] text-[13.5px] leading-[1.5]">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-[13px]">
                    <div className="mt-0.5">
                      <AiAvatar />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-pretty text-[14px] leading-[1.6]">{m.content}</div>
                      {m.metadata?.kind === 'nutrition_card' && (
                        <NutritionResultCard
                          analysis={m.metadata.data}
                          added={addedIds.has(m.id)}
                          onAdded={() => setAddedIds((prev) => new Set(prev).add(m.id))}
                        />
                      )}
                      {m.metadata?.kind === 'recommendations' && <RecommendationsCard items={m.metadata.data} />}
                      {m.metadata?.kind === 'meal_edit_suggestion' && (
                        <MealEditSuggestionCard
                          suggestion={m.metadata.data}
                          applied={addedIds.has(m.id)}
                          onApplied={() => setAddedIds((prev) => new Set(prev).add(m.id))}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {sendMessage.isPending && (
              <div className="flex animate-fi items-center gap-[13px]">
                <AiAvatar />
                <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-surf px-3.5 py-2.5">
                  <span className="flex gap-1">
                    <span className="h-[5px] w-[5px] animate-[blink_1.1s_ease-in-out_infinite] rounded-full bg-acc" />
                    <span className="h-[5px] w-[5px] animate-[blink_1.1s_ease-in-out_0.16s_infinite] rounded-full bg-acc" />
                    <span className="h-[5px] w-[5px] animate-[blink_1.1s_ease-in-out_0.32s_infinite] rounded-full bg-acc" />
                  </span>
                  <span className="text-[11.5px] text-tx3">{t.typing}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative border-t border-line bg-bg px-5 pb-4 pt-3 md:px-[26px]">
        <div className="mx-auto max-w-[700px]">
          {!aiConfigured ? (
            <div className="mb-2.5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-fat/30 bg-fatT px-3.5 py-3 text-[12.5px] text-fat">
              <TriangleAlert className="h-4 w-4 flex-none" />
              <span className="flex-1">{t.app.aiChatBanner}</span>
              <Link to="/settings" className="whitespace-nowrap font-semibold underline underline-offset-2">
                {t.app.aiGoToSettings}
              </Link>
            </div>
          ) : (
            aiWarning && (
              <div className="mb-2.5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-fat/30 bg-fatT px-3.5 py-3 text-[12.5px] text-fat">
                <TriangleAlert className="h-4 w-4 flex-none" />
                <span className="flex-1">{aiWarning}</span>
                <Link to="/settings" className="whitespace-nowrap font-semibold underline underline-offset-2">
                  {t.app.aiGoToSettings}
                </Link>
              </div>
            )
          )}
          <div className="mb-2.5 flex flex-wrap gap-[7px]">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => submit(s)}
                disabled={!aiConfigured}
                className="whitespace-nowrap rounded-full border border-line px-[11px] py-1.5 text-[11.5px] text-tx2 transition-colors hover:bg-surf2 hover:text-tx disabled:pointer-events-none disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit(draft)
            }}
            className="flex items-center gap-2.5 rounded-[17px] border border-line2 bg-surf py-2 pl-4 pr-2 shadow-card"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t.inputPh}
              disabled={!aiConfigured}
              className="min-w-0 flex-1 bg-transparent py-1.5 text-[13.5px] outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              title={t.send}
              disabled={!draft.trim() || sendMessage.isPending || !aiConfigured}
              className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[11px] bg-acc text-[#04120e] transition-[filter,transform] hover:brightness-[1.08] active:scale-[0.94] disabled:opacity-50"
            >
              <ArrowUp className="h-[15px] w-[15px]" />
            </button>
          </form>
          <div className="mt-2 text-center text-[10.5px] text-tx3">{t.disclaimer}</div>
        </div>
      </div>
    </div>
  )
}
