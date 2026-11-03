package com.mylab.backend.groupmember.application.dto;

import java.util.List;
import java.util.UUID;

public record CreateGroupMemberInput(
        UUID researchGroupId,
        UUID personId,
        UUID roleId,
        List<UUID> researchLineIds
) {}
