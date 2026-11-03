import { Navigate } from 'react-router'

import { getSelectedResearchGroupId } from '@/components/layout/selected-research-group-storage'
import { useResearchGroupsQuery } from '@/queries/research-groups/research-groups.queries'

import { EmptyGroupsState, RouteErrorState, RouteLoadingState } from './route-states'

export function ResearchGroupIndexRoute() {
  const { data: groups, isPending, isError, refetch } = useResearchGroupsQuery()

  if (isPending) return <RouteLoadingState />
  if (isError) return <RouteErrorState onRetry={() => void refetch()} />
  if (groups.length === 0) return <EmptyGroupsState />

  const savedGroup = groups.find((group) => group.id === getSelectedResearchGroupId())
  const group = savedGroup ?? groups[0]

  return <Navigate to={`/grupos/${group.id}/painel`} replace />
}
