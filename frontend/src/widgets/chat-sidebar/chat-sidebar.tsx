import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from '@/shared/i18n'
import { useConversations, useCreateConversation } from '@/shared/api/chat'
import { groupConversations, bucketLabel } from '@/entities/conversation/lib/helpers'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/cn'

export function ChatSidebar({
  activeId,
  onNavigate,
}: {
  activeId?: string
  onNavigate?: () => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: conversations, isLoading, isError } = useConversations()
  const createConversation = useCreateConversation()

  const handleNewChat = () => {
    navigate('/chat')
    onNavigate?.()
  }

  const groups = conversations ? groupConversations(conversations) : []

  return (
    <div className="flex h-full flex-col gap-3.5 overflow-y-auto p-4">
      <button
        onClick={handleNewChat}
        disabled={createConversation.isPending}
        className="flex items-center gap-2.5 rounded-xl border border-line2 bg-surf px-3 py-2.5 text-[13px] font-medium transition-colors hover:bg-surf2"
      >
        <span className="grid h-[18px] w-[18px] flex-none place-items-center rounded-[6px] bg-accT text-acc">
          <Plus className="h-3 w-3" />
        </span>
        <span className="flex-1 truncate text-left">{t.chatNew}</span>
      </button>

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}
      {isError && <p className="px-1.5 text-[12px] text-tx3">{t.app.conversationsError}</p>}
      {conversations && conversations.length === 0 && (
        <p className="px-1.5 text-[12px] text-tx3">{t.app.noConversations}</p>
      )}

      {groups.map(({ bucket, items }) => (
        <div key={bucket}>
          <div className="px-1.5 pb-2 font-mono text-[9.5px] tracking-[.16em] text-tx3">{bucketLabel(bucket, t)}</div>
          <div className="flex flex-col gap-0.5">
            {items.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  navigate(`/chat/${c.id}`)
                  onNavigate?.()
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-left text-[12.5px] text-tx2 transition-colors hover:bg-surf2',
                  activeId === c.id && 'bg-surf2',
                )}
              >
                <span className={cn('h-1 w-1 flex-none rounded-full', activeId === c.id ? 'bg-acc' : 'bg-tx3')} />
                <span className="min-w-0 flex-1 truncate">{c.title}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
