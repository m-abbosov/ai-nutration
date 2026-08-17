import { cn } from '@nutriai/shared/lib/cn'
import { userInitial } from '@/entities/user/lib/helpers'
import type { UserDto } from '@nutriai/shared/api/types'

/** Renders the Google profile photo when available, falling back to the initial-letter badge. */
export function Avatar({
  user,
  className,
  textClassName,
}: {
  user: Pick<UserDto, 'avatarUrl' | 'name'> | null | undefined
  className?: string
  textClassName?: string
}) {
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        className={cn('flex-none rounded-full border border-line2 object-cover', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'grid flex-none place-items-center rounded-full border border-line2 bg-accT font-semibold text-acc',
        className,
      )}
    >
      <span className={textClassName}>{userInitial(user as UserDto | null | undefined)}</span>
    </div>
  )
}
