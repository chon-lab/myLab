import { useEffect, useState } from 'react'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { Toast as ToastPrimitive } from 'radix-ui'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { subscribeApiErrorToasts, type AppToast } from '@/lib/api-error-toasts'

export function ApiErrorToaster() {
  const [toasts, setToasts] = useState<AppToast[]>([])

  useEffect(
    () =>
      subscribeApiErrorToasts((toast) => {
        setToasts((current) => [...current, toast])
      }),
    [],
  )

  function removeToast(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  return (
    <ToastPrimitive.Provider label="Notificações" duration={6000} swipeDirection="right">
      <ToastPrimitive.Viewport aria-label="Notificações" className="fixed left-1/2 top-4 z-[100] flex max-h-screen w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 flex-col gap-2 p-0 sm:top-6">
        {toasts.map((toast) => {
          const Icon = toast.kind === 'success' ? CircleCheck : toast.kind === 'info' ? Info : CircleAlert
          const colors =
            toast.kind === 'success'
              ? 'border-primary/25 text-primary'
              : toast.kind === 'info'
                ? 'border-brand-yellow bg-brand-yellow/10 text-brand-navy'
                : 'border-destructive/30 text-destructive'

          return (
            <ToastPrimitive.Root
              key={toast.id}
              onOpenChange={(open) => {
                if (!open) removeToast(toast.id)
              }}
              className={cn(
                'flex items-start gap-2.5 rounded-lg border bg-card p-3 text-foreground shadow-md outline-none data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=open]:animate-in',
                colors,
              )}
            >
              <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <ToastPrimitive.Title className="text-sm font-semibold text-brand-navy">
                  {toast.title}
                </ToastPrimitive.Title>
                <ToastPrimitive.Description className="mt-1 max-h-[50vh] overflow-y-auto whitespace-pre-line text-sm text-muted-foreground">
                  {toast.description}
                </ToastPrimitive.Description>
              </div>
              <ToastPrimitive.Close asChild aria-label="Fechar notificação">
                <Button variant="ghost" size="icon-sm" className="-mr-2 -mt-2 shrink-0 text-muted-foreground">
                  <X aria-hidden="true" />
                </Button>
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          )
        })}
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Provider>
  )
}
