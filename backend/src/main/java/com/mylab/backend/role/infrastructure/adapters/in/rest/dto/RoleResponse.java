package com.mylab.backend.role.infrastructure.adapters.in.rest.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleResponse {

    private UUID id;
    private UUID researchGroupId;
    private String name;
    private boolean fullAccess;
    private List<RolePermissionDto> permissions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
