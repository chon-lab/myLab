package com.mylab.backend.groupmember.infrastructure.adapters.in.rest.dto;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateGroupMemberRequest {

    private Boolean active;

    private List<UUID> researchLineIds;
}
