import { Skeleton } from '@/components/ui/skeleton'

export function PanelLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Carregando" className="space-y-4 p-5">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}

export function PanelError({ message }: { message: string }) {
  return (
    <p role="alert" className="p-5 text-sm text-destructive">
      {message}
    </p>
  )
}

export function PanelEmpty({ message }: { message: string }) {
  return <p className="p-5 text-sm text-muted-foreground">{message}</p>
}
