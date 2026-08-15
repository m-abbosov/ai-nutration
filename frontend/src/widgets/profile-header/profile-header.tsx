import { useState } from 'react'
import { useTranslation } from '@/shared/i18n'
import { EditProfileDialog } from '@/features/edit-profile/edit-profile-dialog'
import { Button } from '@/shared/ui/button'
import { Avatar } from '@/shared/ui/avatar'
import type { UserDto } from '@/shared/api/types'

export function ProfileHeader({ user, streakDays, dayPct }: { user: UserDto; streakDays: number; dayPct: number }) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const arc = Math.max(0, Math.min(100, dayPct))

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-line bg-surf p-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(70% 120% at 10% 0, var(--accT), transparent 62%)' }}
      />
      <div className="relative flex flex-wrap items-center gap-5">
        <div className="relative h-[74px] w-[74px] flex-none">
          <svg viewBox="0 0 74 74" className="absolute inset-0">
            <circle
              cx="37"
              cy="37"
              r="35"
              fill="none"
              stroke="var(--acc)"
              strokeWidth="1.5"
              pathLength={100}
              strokeDasharray={`${arc} 100`}
              strokeLinecap="round"
              transform="rotate(-90 37 37)"
            />
          </svg>
          <Avatar user={user} className="absolute inset-1.5 h-[62px] w-[62px] font-medium" textClassName="text-[25px]" />
        </div>
        <div className="min-w-[190px] flex-1">
          <h2 className="m-0 text-[22px] font-medium tracking-[-.02em]">{user.name}</h2>
          <div className="mt-[7px] flex flex-wrap gap-2">
            {user.goal && (
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accT px-[11px] py-[5px] text-[11.5px] text-acc">
                {t.goalLabel[user.goal]}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line2 px-[11px] py-[5px] text-[11.5px] text-tx2">
              <span className="h-1 w-1 rounded-full bg-acc" />
              {t.prStreakDays(streakDays)}
            </span>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditing(true)}>
          {t.prEdit}
        </Button>
      </div>
      {editing && <EditProfileDialog user={user} open={editing} onOpenChange={setEditing} />}
    </section>
  )
}
