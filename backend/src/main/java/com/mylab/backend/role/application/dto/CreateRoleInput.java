package com.mylab.backend.role.application.dto;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.role.domain.model.RolePermission;

public record CreateRoleInput(
        UUID researchGroupId,
        String name,
        List<RolePermission> permissions
) {}
