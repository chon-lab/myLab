package com.mylab.backend.groupmember.infrastructure.adapters.in.rest.dto;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.groupmember.domain.model.GroupMemberRole;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateGroupMemberRequest {

    private Boolean active;

    private GroupMemberRole role;

    private List<UUID> researchLineIds;
}
