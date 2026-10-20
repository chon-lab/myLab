import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type DashboardPanelProps = {
  id: string
  title: string
  action?: ReactNode
  className?: string
  children: ReactNode
}

export function DashboardPanel({ id, title, action, className, children }: DashboardPanelProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn('overflow-hidden rounded-xl border bg-card', className)}
    >
      <header className="flex items-center justify-between gap-4 border-b px-5 py-4">
        <h2 id={id} className="text-base font-bold text-foreground">
          {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  )
}
