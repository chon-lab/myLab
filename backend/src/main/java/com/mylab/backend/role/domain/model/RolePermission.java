package com.mylab.backend.role.domain.model;

import com.mylab.backend.role.domain.exception.InvalidRoleException;

import lombok.Builder;
import lombok.Getter;

@Getter
public class RolePermission {

    private final PermissionResource resource;
    private final boolean canRead;
    private final boolean canWrite;
    private final boolean canDelete;

    @Builder
    public RolePermission(
            PermissionResource resource,
            boolean canRead,
            boolean canWrite,
            boolean canDelete) {
        if (resource == null) {
            throw new InvalidRoleException("permission resource must not be null");
        }
        this.resource = resource;
        this.canRead = canRead;
        this.canWrite = canWrite;
        this.canDelete = canDelete;
    }

    public boolean allows(PermissionAction action) {
        return switch (action) {
            case READ -> canRead;
            case WRITE -> canWrite;
            case DELETE -> canDelete;
        };
    }

    public boolean grantsAnything() {
        return canRead || canWrite || canDelete;
    }
}
