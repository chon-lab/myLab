import { createContext, useContext } from 'react'

import type { ResearchGroup } from '@/types/research-groups/research-group.types'

export const ResearchGroupContext = createContext<ResearchGroup | null>(null)

export function useResearchGroup() {
  const group = useContext(ResearchGroupContext)

  if (!group) throw new Error('useResearchGroup deve ser usado dentro de ResearchGroupProvider.')

  return group
}
