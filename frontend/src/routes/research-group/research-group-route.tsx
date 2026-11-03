import { Navigate, useParams } from 'react-router'

import { AppShell } from '@/components/layout/app-shell'
import { ResearchGroupProvider } from '@/components/layout/research-group-provider'
import { useResearchGroupsQuery } from '@/queries/research-groups/research-groups.queries'

import { EmptyGroupsState, RouteErrorState, RouteLoadingState } from './route-states'

export function ResearchGroupRoute() {
  const { data: groups, isPending, isError, refetch } = useResearchGroupsQuery()
  const { researchGroupId } = useParams()

  if (isPending) return <RouteLoadingState />
  if (isError) return <RouteErrorState onRetry={() => void refetch()} />
  if (groups.length === 0) return <EmptyGroupsState />

  const group = groups.find((item) => item.id === researchGroupId)

  if (!group) return <Navigate to="/" replace />

  return (
    <ResearchGroupProvider group={group}>
      <AppShell groups={groups} selectedGroup={group} />
    </ResearchGroupProvider>
  )
}
