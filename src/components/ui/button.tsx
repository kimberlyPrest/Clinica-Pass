import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:shadow-lg',
  {
    variants: {
      variant: {
        default: 'bg-primary text-on-primary hover:bg-primary-container',
        destructive: 'bg-error text-white hover:bg-error/90',
        outline:
          'border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container-low',
        secondary: 'bg-secondary-container text-on-surface hover:bg-secondary-container/80',
        ghost: 'text-on-surface hover:bg-surface-container-low shadow-none hover:shadow-none',
        link: 'text-primary underline-offset-4 hover:underline shadow-none hover:shadow-none',
      },
      size: {
        default: 'h-[44px] px-4 py-2 min-h-[44px]',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-12 rounded-md px-8',
        icon: 'h-[44px] w-[44px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
