package com.mylab.backend.groupmember.infrastructure.adapters.in.rest.dto;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.groupmember.domain.model.GroupMemberRole;
import com.mylab.backend.groupmember.domain.model.MembershipStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateGroupMemberRequest {

    private MembershipStatus status;

    private GroupMemberRole role;

    private UUID roleId;

    private List<UUID> researchLineIds;
}
