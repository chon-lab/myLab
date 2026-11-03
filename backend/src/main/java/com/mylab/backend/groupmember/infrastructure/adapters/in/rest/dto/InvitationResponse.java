package com.mylab.backend.groupmember.infrastructure.adapters.in.rest.dto;

import java.util.UUID;

public record InvitationResponse(
        UUID membershipId,
        UUID researchGroupId,
        String researchGroupName,
        UUID roleId,
        String roleName
) {}
