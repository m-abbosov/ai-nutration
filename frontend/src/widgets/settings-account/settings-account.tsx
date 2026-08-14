import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/shared/i18n'
import { useLogout } from '@/shared/api/auth'
import { userInitial } from '@/entities/user/lib/helpers'
import type { UserDto } from '@/shared/api/types'

export function SettingsAccount({ user }: { user: UserDto }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useLogout()

  const handleSignOut = () => {
    if (!window.confirm(t.app.signOutConfirm)) return
    logout.mutate(undefined, { onSettled: () => navigate('/login', { replace: true }) })
  }

  return (
    <>
      <div className="mt-6 pb-[11px] font-mono text-[9.5px] tracking-[.16em] text-tx3">{t.stAcc}</div>
      <div className="flex flex-col gap-px overflow-hidden rounded-[18px] border border-line bg-line">
        <div className="flex items-center gap-3.5 bg-surf px-[18px] py-[15px]">
          <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-accT text-[13px] font-semibold text-acc">
            {userInitial(user)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-medium">{user.name}</div>
            <div className="mt-px truncate text-[12px] text-tx3">{user.email ?? '—'}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 bg-surf px-[18px] py-[15px] text-left transition-colors hover:bg-surfH"
        >
          <span className="flex-1 text-[13.5px] font-medium text-fat">{t.stOut}</span>
          <span className="font-mono text-[11px] text-tx3">→</span>
        </button>
      </div>
      <div className="mt-4 text-center font-mono text-[10px] tracking-[.12em] text-tx3">{t.stVer}</div>
    </>
  )
}
