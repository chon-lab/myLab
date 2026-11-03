import { useResearchGroupsQuery } from '@/queries/research-groups/research-groups.queries'

import { EmptyGroupsState, RouteErrorState, RouteLoadingState } from './route-states'

export function NewResearchGroupRoute() {
  const { data: groups, isPending, isError, refetch } = useResearchGroupsQuery()

  if (isPending) return <RouteLoadingState />
  if (isError) return <RouteErrorState onRetry={() => void refetch()} />

  return <EmptyGroupsState groups={groups} />
}
