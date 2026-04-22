import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-semibold tracking-[0.05em] transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-surface-container text-on-surface hover:bg-surface-container-low',
        primary: 'border-transparent bg-primary text-on-primary hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary-container text-on-surface hover:bg-secondary-container/80',
        success: 'border-transparent bg-success/10 text-success hover:bg-success/20',
        warning: 'border-transparent bg-warning/10 text-warning hover:bg-warning/20',
        error: 'border-transparent bg-error/10 text-error hover:bg-error/20',
        info: 'border-transparent bg-info/10 text-info hover:bg-info/20',
        destructive: 'border-transparent bg-error text-white hover:bg-error/80',
        outline: 'text-on-surface border-outline-variant',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
