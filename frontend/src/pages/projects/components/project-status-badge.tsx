import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { projectStatusBadgeClasses, projectStatusLabels } from '@/pages/projects/project-format'
import type { ProjectStatus } from '@/types/projects/project.types'

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge
      className={cn(
        'h-6 rounded-full px-2.5 text-xs font-semibold',
        projectStatusBadgeClasses[status],
      )}
    >
      {projectStatusLabels[status]}
    </Badge>
  )
}
