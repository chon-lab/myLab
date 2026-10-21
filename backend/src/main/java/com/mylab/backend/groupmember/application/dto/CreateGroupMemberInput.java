package com.mylab.backend.groupmember.application.dto;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.groupmember.domain.model.GroupMemberRole;

public record CreateGroupMemberInput(
        UUID researchGroupId,
        UUID personId,
        GroupMemberRole role,
        List<UUID> researchLineIds
) {}
