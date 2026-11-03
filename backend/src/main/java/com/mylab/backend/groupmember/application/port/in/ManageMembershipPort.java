package com.mylab.backend.groupmember.application.port.in;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.groupmember.application.dto.InvitationView;

public interface ManageMembershipPort {
    List<InvitationView> getPendingInvitations(UUID personId);
    void acceptInvitation(UUID personId, UUID membershipId);
    void rejectInvitation(UUID personId, UUID membershipId);
    void leaveResearchGroup(UUID personId, UUID researchGroupId);
}
