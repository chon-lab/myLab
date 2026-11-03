package com.mylab.backend.groupmember.application.dto;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.groupmember.domain.model.GroupMemberRole;
import com.mylab.backend.groupmember.domain.model.MembershipStatus;

public record UpdateGroupMemberInput(
        MembershipStatus status,
        GroupMemberRole role,
        UUID roleId,
        List<UUID> researchLineIds
) {}
