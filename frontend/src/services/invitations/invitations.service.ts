import { api } from '@/lib/api-client'
import type { Invitation } from '@/types/invitations/invitation.types'

export const invitationsService = {
  listMine: () => api.get<Invitation[]>('/api/v1/me/invitations'),
  accept: (membershipId: string) =>
    api.post<void>(`/api/v1/me/invitations/${membershipId}/accept`),
  reject: (membershipId: string) =>
    api.post<void>(`/api/v1/me/invitations/${membershipId}/reject`),
  leaveGroup: (researchGroupId: string) =>
    api.post<void>(`/api/v1/me/research-groups/${researchGroupId}/leave`),
}
