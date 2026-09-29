package com.mylab.backend.groupmember.infrastructure.adapters.in.rest.dto;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupMemberResponse {

    private UUID id;
    private UUID personId;
    private UUID researchGroupId;
    private boolean active;
    private Set<UUID> researchLineIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
