import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { projectStatusBadgeClasses, projectStatusLabels } from '@/pages/projects/project-format'
import type { ProjectStatus } from '@/types/projects/project.types'

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge
      className={cn(
        'h-5 rounded-full px-2 text-[0.65rem] font-semibold',
        projectStatusBadgeClasses[status],
      )}
    >
      {projectStatusLabels[status]}
    </Badge>
  )
}
