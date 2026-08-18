import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useTranslation } from '@nutriai/shared/i18n'
import { useAuth } from '@/app/providers/auth-provider'
import { Avatar } from '@/shared/ui/avatar'
import { LanguageSwitchFlyout } from '@/features/language-switch/language-switch'
import { DashIcon, CoachIcon, MealsIcon, ProgIcon, ProfIcon, SetIcon, LogoMark } from '@/shared/ui/nav-icons'
import { cn } from '@nutriai/shared/lib/cn'
import { fmtNumber } from '@nutriai/shared/lib/format'

const navItems = [
  { to: '/dashboard', labelKey: 'navDash' as const, Icon: DashIcon, dot: true },
  { to: '/chat', labelKey: 'navCoach' as const, Icon: CoachIcon, ai: true },
  { to: '/meals', labelKey: 'navMeals' as const, Icon: MealsIcon, dot: true },
  { to: '/progress', labelKey: 'navProg' as const, Icon: ProgIcon, dot: true },
  { to: '/profile', labelKey: 'navProf' as const, Icon: ProfIcon, dot: true },
]

const STORAGE_KEY = 'nutriai.sidebarCollapsed'

function readStoredCollapsed(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1'
}

export function AppSidebar() {
  const { t, lang } = useTranslation()
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(readStoredCollapsed)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  const planLabel =
    user?.goal && user.dailyCalorieTarget
      ? `${t.goalLabel[user.goal]} · ${fmtNumber(user.dailyCalorieTarget, lang)} ${t.kcal}`
      : t.plan

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-none flex-col self-start border-r border-line bg-bg2 px-4 pb-4 pt-[22px] transition-[width] duration-200',
        collapsed ? 'w-[76px]' : 'w-[254px]',
      )}
    >
      <div className={cn('flex items-center pb-6', collapsed ? 'flex-col gap-3 px-0' : 'gap-2.5 px-2')}>
        <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
          <LogoMark className="flex-none" />
          {!collapsed && (
            <div className="text-[16.5px] font-semibold tracking-[-.015em]">
              Nutri<span className="text-acc">AI</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? t.app.expandSidebar : t.app.collapseSidebar}
          className={cn(
            'grid h-7 w-7 flex-none place-items-center rounded-[9px] text-tx3 transition-colors hover:bg-surf2 hover:text-tx',
            !collapsed && 'ml-auto',
          )}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="px-2.5 pb-[9px] font-mono text-[9.5px] tracking-[.16em] text-tx3">{t.navSection}</div>
      )}
      <nav className="flex flex-col gap-0.5">
        {navItems.map(({ to, labelKey, Icon, ai }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            title={collapsed ? t[labelKey] : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-[11px] rounded-[11px] py-[9px] text-left transition-colors hover:bg-surf2',
                collapsed ? 'justify-center px-0' : 'px-2.5',
                isActive ? 'bg-surf2 text-tx' : 'text-tx2',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-[13.5px] font-medium">{t[labelKey]}</span>
                    {ai && (
                      <span className="rounded-[5px] bg-accT px-[5px] py-0.5 font-mono text-[9px] tracking-[.08em] text-acc">
                        AI
                      </span>
                    )}
                    {!ai && isActive && <span className="h-[5px] w-[5px] rounded-full bg-acc" />}
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="flex flex-col gap-0.5 border-t border-line pt-3.5">
        <NavLink
          to="/settings"
          title={collapsed ? t.navSet : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-[11px] rounded-[11px] py-[9px] text-left transition-colors hover:bg-surf2',
              collapsed ? 'justify-center px-0' : 'px-2.5',
              isActive ? 'bg-surf2 text-tx' : 'text-tx2',
            )
          }
        >
          <SetIcon />
          {!collapsed && <span className="flex-1 text-[13.5px] font-medium">{t.navSet}</span>}
        </NavLink>
        <LanguageSwitchFlyout compact={collapsed} />
        <NavLink
          to="/profile"
          title={collapsed ? user?.name : undefined}
          className={cn(
            'mt-1.5 flex items-center rounded-xl py-2 text-left transition-colors hover:bg-surf2',
            collapsed ? 'justify-center px-0' : 'gap-2.5 px-2',
          )}
        >
          <Avatar user={user} className="h-[30px] w-[30px]" textClassName="text-[12.5px]" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12.5px] font-medium">{user?.name ?? '…'}</div>
              <div className="truncate text-[10.5px] text-tx3">{planLabel}</div>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  )
}
