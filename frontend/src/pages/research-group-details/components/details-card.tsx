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
      <header className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 px-5 sm:px-6">
        <h2 id={id} className="text-base font-bold text-brand-navy">
          {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  )
}

export function DetailsList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 px-5 py-6 text-sm sm:grid-cols-[minmax(9rem,12rem)_minmax(0,1fr)] sm:px-6">
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="-mt-3 font-medium break-words text-brand-navy sm:mt-0">
            {item.value ?? <span className="font-normal text-muted-foreground">Não informado</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}
