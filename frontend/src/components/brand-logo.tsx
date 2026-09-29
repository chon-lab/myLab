import { FlaskConical } from 'lucide-react'

import { cn } from '@/lib/utils'

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 text-xl font-bold', className)}>
      <FlaskConical aria-hidden="true" className="size-6 text-brand-yellow" />
      myLab
    </span>
  )
}
