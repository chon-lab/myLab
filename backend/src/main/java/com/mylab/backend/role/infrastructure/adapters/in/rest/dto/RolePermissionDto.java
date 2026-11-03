package com.mylab.backend.role.infrastructure.adapters.in.rest.dto;

import com.mylab.backend.role.domain.model.PermissionResource;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RolePermissionDto {

    @NotNull
    private PermissionResource resource;

    private boolean canRead;
    private boolean canWrite;
    private boolean canDelete;
}
