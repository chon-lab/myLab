package com.mylab.backend.auth.infrastructure.web.dto;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.role.infrastructure.adapters.in.rest.dto.RolePermissionDto;

public record MyPermissionsResponse(
        UUID researchGroupId,
        String roleName,
        boolean fullAccess,
        List<RolePermissionDto> permissions
) {}
