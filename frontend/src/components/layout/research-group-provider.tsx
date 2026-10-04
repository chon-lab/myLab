import type { ReactNode } from 'react'

import { ResearchGroupContext } from '@/components/layout/research-group-context'
import type { ResearchGroup } from '@/types/research-groups/research-group.types'

export function ResearchGroupProvider({ group, children }: { group: ResearchGroup; children: ReactNode }) {
  return <ResearchGroupContext.Provider value={group}>{children}</ResearchGroupContext.Provider>
}
