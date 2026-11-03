import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { researchGroupsKeys } from '@/queries/research-groups/research-groups.queries'
import { invitationsService } from '@/services/invitations/invitations.service'

export const invitationsKeys = {
  all: ['invitations'] as const,
  mine: () => [...invitationsKeys.all, 'mine'] as const,
}

export const myInvitationsQueryOptions = () =>
  queryOptions({
    queryKey: invitationsKeys.mine(),
    queryFn: () => invitationsService.listMine(),
  })

export function useMyInvitationsQuery() {
  return useQuery(myInvitationsQueryOptions())
}

function useInvalidateAfterMembershipChange() {
  const queryClient = useQueryClient()

  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: invitationsKeys.mine() }),
    queryClient.invalidateQueries({ queryKey: researchGroupsKeys.all }),
  ])
}

export function useAcceptInvitationMutation() {
  const invalidate = useInvalidateAfterMembershipChange()

  return useMutation({
    mutationFn: (membershipId: string) => invitationsService.accept(membershipId),
    onSuccess: invalidate,
  })
}

export function useRejectInvitationMutation() {
  const invalidate = useInvalidateAfterMembershipChange()

  return useMutation({
    mutationFn: (membershipId: string) => invitationsService.reject(membershipId),
    onSuccess: invalidate,
  })
}

export function useLeaveGroupMutation() {
  const invalidate = useInvalidateAfterMembershipChange()

  return useMutation({
    mutationFn: (researchGroupId: string) => invitationsService.leaveGroup(researchGroupId),
    onSuccess: invalidate,
  })
}
