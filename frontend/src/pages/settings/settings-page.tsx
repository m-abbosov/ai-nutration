import { useTranslation } from '@/shared/i18n'
import { useAuth } from '@/app/providers/auth-provider'
import { SettingsAppearance } from '@/widgets/settings-appearance/settings-appearance'
import { SettingsAi } from '@/widgets/settings-ai/settings-ai'
import { SettingsNotifications } from '@/widgets/settings-notifications/settings-notifications'
import { SettingsAccount } from '@/widgets/settings-account/settings-account'
import { Skeleton } from '@/shared/ui/skeleton'

export function SettingsPage() {
  const { t } = useTranslation()
  const { user, isLoading } = useAuth()

  return (
    <div className="animate-fu max-w-[760px] px-5 pb-[70px] pt-[22px] md:px-[34px]">
      <h2 className="m-0 text-[22px] font-medium tracking-[-.02em] md:text-[24px]">{t.stTitle}</h2>
      <p className="m-0 mt-[5px] text-[13.5px] text-tx2">{t.stSub}</p>

      <SettingsAppearance />
      <SettingsAi />

      {isLoading || !user ? (
        <div className="mt-6 flex flex-col gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : (
        <>
          <SettingsNotifications user={user} />
          <SettingsAccount user={user} />
        </>
      )}
    </div>
  )
}
