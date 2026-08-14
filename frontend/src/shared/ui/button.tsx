import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-[13px] font-semibold transition-[filter,transform,background,color,border-color] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc/50',
  {
    variants: {
      variant: {
        primary: 'bg-acc text-[#04120e] hover:brightness-[1.08] shadow-[0_8px_22px_-10px_var(--accG)]',
        secondary: 'border border-line2 text-tx hover:bg-surf2',
        ghost: 'text-tx2 hover:bg-surf2 hover:text-tx',
        tinted: 'bg-accT text-acc border border-line2 hover:brightness-[1.12]',
        destructive: 'text-fat hover:bg-fatT',
      },
      size: {
        default: 'px-4 py-2.5',
        sm: 'px-3 py-2 text-[12.5px]',
        lg: 'px-6 py-3',
        icon: 'h-9 w-9 p-0 rounded-[10px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  },
)
Button.displayName = 'Button'
