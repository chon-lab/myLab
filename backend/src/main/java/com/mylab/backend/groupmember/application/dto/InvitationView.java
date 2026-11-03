package com.mylab.backend.groupmember.application.dto;

import java.util.UUID;

public record InvitationView(
        UUID membershipId,
        UUID researchGroupId,
        String researchGroupName,
        UUID roleId,
        String roleName
) {}
