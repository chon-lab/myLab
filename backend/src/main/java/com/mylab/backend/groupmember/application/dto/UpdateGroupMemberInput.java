package com.mylab.backend.groupmember.application.dto;

import java.util.List;
import java.util.UUID;

public record UpdateGroupMemberInput(
        Boolean active,
        List<UUID> researchLineIds
) {}
