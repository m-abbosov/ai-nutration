import { NavLink } from 'react-router-dom'
import { useTranslation } from '@/shared/i18n'
import { useAuth } from '@/app/providers/auth-provider'
import { userInitial } from '@/entities/user/lib/helpers'
import { LanguageSwitchFlyout } from '@/features/language-switch/language-switch'
import { DashIcon, CoachIcon, MealsIcon, ProgIcon, ProfIcon, SetIcon, LogoMark } from '@/shared/ui/nav-icons'
import { cn } from '@/shared/lib/cn'
import { fmtNumber } from '@/shared/lib/format'

const navItems = [
  { to: '/', labelKey: 'navDash' as const, Icon: DashIcon, dot: true },
  { to: '/chat', labelKey: 'navCoach' as const, Icon: CoachIcon, ai: true },
  { to: '/meals', labelKey: 'navMeals' as const, Icon: MealsIcon, dot: true },
  { to: '/progress', labelKey: 'navProg' as const, Icon: ProgIcon, dot: true },
  { to: '/profile', labelKey: 'navProf' as const, Icon: ProfIcon, dot: true },
]

export function AppSidebar() {
  const { t, lang } = useTranslation()
  const { user } = useAuth()
  const planLabel =
    user?.goal && user.dailyCalorieTarget
      ? `${t.goalLabel[user.goal]} · ${fmtNumber(user.dailyCalorieTarget, lang)} ${t.kcal}`
      : t.plan

  return (
    <aside className="sticky top-0 flex h-screen w-[254px] flex-none flex-col self-start border-r border-line bg-bg2 px-4 pb-4 pt-[22px]">
      <div className="flex items-center gap-2.5 px-2 pb-6">
        <LogoMark className="flex-none" />
        <div className="text-[16.5px] font-semibold tracking-[-.015em]">
          Nutri<span className="text-acc">AI</span>
        </div>
      </div>

      <div className="px-2.5 pb-[9px] font-mono text-[9.5px] tracking-[.16em] text-tx3">{t.navSection}</div>
      <nav className="flex flex-col gap-0.5">
        {navItems.map(({ to, labelKey, Icon, ai }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-[11px] rounded-[11px] px-2.5 py-[9px] text-left transition-colors hover:bg-surf2',
                isActive ? 'bg-surf2 text-tx' : 'text-tx2',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon />
                <span className="flex-1 text-[13.5px] font-medium">{t[labelKey]}</span>
                {ai && (
                  <span className="rounded-[5px] bg-accT px-[5px] py-0.5 font-mono text-[9px] tracking-[.08em] text-acc">
                    AI
                  </span>
                )}
                {!ai && isActive && <span className="h-[5px] w-[5px] rounded-full bg-acc" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="flex flex-col gap-0.5 border-t border-line pt-3.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-[11px] rounded-[11px] px-2.5 py-[9px] text-left transition-colors hover:bg-surf2',
              isActive ? 'bg-surf2 text-tx' : 'text-tx2',
            )
          }
        >
          <SetIcon />
          <span className="flex-1 text-[13.5px] font-medium">{t.navSet}</span>
        </NavLink>
        <LanguageSwitchFlyout />
        <NavLink
          to="/profile"
          className="mt-1.5 flex items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-surf2"
        >
          <div className="grid h-[30px] w-[30px] flex-none place-items-center rounded-full border border-line2 bg-accT text-[12.5px] font-semibold text-acc">
            {userInitial(user)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-medium">{user?.name ?? '…'}</div>
            <div className="truncate text-[10.5px] text-tx3">{planLabel}</div>
          </div>
        </NavLink>
      </div>
    </aside>
  )
}
