import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-[44px] w-full rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-[12px] text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-on-surface placeholder:text-outline focus-visible:outline-none focus-visible:border-primary focus-visible:border-2 focus-visible:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 ease-in-out',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
