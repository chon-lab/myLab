import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { researchLinesKeys } from '@/queries/research-lines/research-lines.queries'
import { membersService } from '@/services/members/members.service'
import type {
  CreatePersonRequest,
  GroupMemberListItem,
  UpdateGroupMemberRequest,
  UpdatePersonRequest,
} from '@/types/members/member.types'

export const membersKeys = {
  all: ['members'] as const,
  lists: () => [...membersKeys.all, 'list'] as const,
  listByGroup: (researchGroupId: string) => [...membersKeys.lists(), researchGroupId] as const,
  details: () => [...membersKeys.all, 'detail'] as const,
  detail: (personId: string) => [...membersKeys.details(), personId] as const,
  researchLines: (researchGroupId: string) => [...membersKeys.all, 'research-lines', researchGroupId] as const,
}

export const membersByGroupQueryOptions = (researchGroupId: string) =>
  queryOptions({
    queryKey: membersKeys.listByGroup(researchGroupId),
    queryFn: async (): Promise<GroupMemberListItem[]> => {
      const [people, memberships] = await Promise.all([
        membersService.listPeopleByGroup(researchGroupId),
        membersService.listMembershipsByGroup(researchGroupId),
      ])
      const peopleById = new Map(people.map((person) => [person.id, person]))

      return memberships
        .filter((membership) => membership.active)
        .flatMap((membership) => {
          const person = peopleById.get(membership.personId)
          return person ? [{ person, membership }] : []
        })
    },
  })

export const memberResearchLinesQueryOptions = (researchGroupId: string) =>
  queryOptions({
    queryKey: membersKeys.researchLines(researchGroupId),
    queryFn: () => membersService.listResearchLinesByGroup(researchGroupId),
  })

export const memberDetailsQueryOptions = (personId: string) =>
  queryOptions({
    queryKey: membersKeys.detail(personId),
    queryFn: () => membersService.getPerson(personId),
  })

export function useMembersQuery(researchGroupId: string) {
  return useQuery(membersByGroupQueryOptions(researchGroupId))
}

export function useMemberResearchLinesQuery(researchGroupId: string) {
  return useQuery(memberResearchLinesQueryOptions(researchGroupId))
}

export function useMemberDetailsQuery(personId: string | null) {
  return useQuery({
    ...memberDetailsQueryOptions(personId ?? ''),
    enabled: Boolean(personId),
  })
}

function useInvalidateMembers(researchGroupId: string) {
  const queryClient = useQueryClient()

  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: membersKeys.listByGroup(researchGroupId) }),
    queryClient.invalidateQueries({ queryKey: researchLinesKeys.membersByGroup(researchGroupId) }),
  ])
}

export function useCreateMemberMutation(researchGroupId: string) {
  const invalidate = useInvalidateMembers(researchGroupId)

  return useMutation({
    mutationFn: (body: CreatePersonRequest) => membersService.createPerson(researchGroupId, body),
    onSuccess: invalidate,
  })
}

export function useUpdatePersonMutation(researchGroupId: string) {
  const invalidate = useInvalidateMembers(researchGroupId)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ personId, body }: { personId: string; body: UpdatePersonRequest }) =>
      membersService.updatePerson(personId, body),
    onSuccess: async (_data, variables) => {
      await invalidate()
      await queryClient.invalidateQueries({ queryKey: membersKeys.detail(variables.personId) })
    },
  })
}

export function useUpdateMembershipMutation(researchGroupId: string) {
  const invalidate = useInvalidateMembers(researchGroupId)

  return useMutation({
    mutationFn: ({ personId, body }: { personId: string; body: UpdateGroupMemberRequest }) =>
      membersService.updateMembership(researchGroupId, personId, body),
    onSuccess: invalidate,
  })
}
