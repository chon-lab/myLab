import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function DetailsCard({
  id,
  title,
  action,
  children,
  className,
}: {
  id: string
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn('rounded-xl border border-slate-200 bg-card shadow-sm', className)}
    >
      <header className="flex min-h-12 items-center justify-between gap-3 border-b border-slate-200 px-4 sm:px-5">
        <h2 id={id} className="text-base font-bold text-brand-navy">
          {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  )
}

export function DetailsList({ items, compact = false }: { items: { label: string; value: ReactNode }[]; compact?: boolean }) {
  return (
    <dl className={cn(
      'grid gap-x-4 gap-y-2 px-4 py-3 text-sm sm:px-5',
      compact
        ? 'sm:grid-cols-[minmax(6rem,7rem)_minmax(0,1fr)]'
        : 'sm:grid-cols-[minmax(9rem,10rem)_minmax(0,1fr)]',
    )}>
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="-mt-1 min-w-0 font-medium break-words text-brand-navy sm:mt-0">
            {item.value ?? <span className="font-normal text-muted-foreground">Não informado</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}
