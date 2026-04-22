/* Toaster Component - A component that displays a toaster (a component that displays a toast) - from shadcn/ui (exposes Toaster) */
import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { Check, X, AlertTriangle, Info } from 'lucide-react'

const getIcon = (variant?: string) => {
  switch (variant) {
    case 'success':
      return <Check className="h-6 w-6 shrink-0" />
    case 'error':
      return <X className="h-6 w-6 shrink-0" />
    case 'warning':
      return <AlertTriangle className="h-6 w-6 shrink-0" />
    case 'info':
      return <Info className="h-6 w-6 shrink-0" />
    default:
      return null
  }
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const Icon = getIcon(variant)
        return (
          <Toast key={id} variant={variant as any} {...props}>
            {Icon && <div className="mt-0.5">{Icon}</div>}
            <div className="flex-1 grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
