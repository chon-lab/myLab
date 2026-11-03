package com.mylab.backend.role.application.dto;

import java.util.List;

import com.mylab.backend.role.domain.model.RolePermission;

public record UpdateRoleInput(
        String name,
        List<RolePermission> permissions
) {}
