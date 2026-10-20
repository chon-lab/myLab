package com.mylab.backend.groupmember.infrastructure.adapters.in.rest.dto;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.groupmember.domain.model.GroupMemberRole;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateGroupMemberRequest {

    @NotNull
    private UUID personId;

    @NotNull
    private GroupMemberRole role;

    private List<UUID> researchLineIds;
}
