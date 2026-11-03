package com.mylab.backend.role.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.mylab.backend.common.domain.service.TextCaseNormalizer;
import com.mylab.backend.role.domain.exception.InvalidRoleException;

import lombok.Getter;

@Getter
public class Role {

    private final UUID id;
    private final UUID researchGroupId;
    private String name;
    private final boolean fullAccess;
    private final Map<PermissionResource, RolePermission> permissions;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Role(
            UUID id,
            UUID researchGroupId,
            String name,
            boolean fullAccess,
            List<RolePermission> permissions,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = requireNonNull(id, "id");
        this.researchGroupId = requireNonNull(researchGroupId, "researchGroupId");
        this.name = TextCaseNormalizer.sentence(requireNonBlank(name, "name"));
        this.fullAccess = fullAccess;
        this.permissions = indexByResource(permissions);
        this.createdAt = requireNonNull(createdAt, "createdAt");
        this.updatedAt = requireNonNull(updatedAt, "updatedAt");
    }

    public static Role create(
            UUID researchGroupId,
            String name,
            boolean fullAccess,
            List<RolePermission> permissions,
            LocalDateTime occurredAt) {
        return new Role(
                UUID.randomUUID(),
                researchGroupId,
                name,
                fullAccess,
                permissions,
                occurredAt,
                occurredAt);
    }

    public static Role admin(UUID researchGroupId, LocalDateTime occurredAt) {
        return create(researchGroupId, "Admin", true, List.of(), occurredAt);
    }

    public boolean can(PermissionResource resource, PermissionAction action) {
        if (fullAccess) {
            return true;
        }
        RolePermission permission = permissions.get(resource);
        return permission != null && permission.allows(action);
    }

    public List<RolePermission> getPermissions() {
        return List.copyOf(permissions.values());
    }

    public void rename(String newName, LocalDateTime occurredAt) {
        this.name = TextCaseNormalizer.sentence(requireNonBlank(newName, "name"));
        this.updatedAt = requireNonNull(occurredAt, "updatedAt");
    }

    private static Map<PermissionResource, RolePermission> indexByResource(List<RolePermission> permissions) {
        Map<PermissionResource, RolePermission> indexed = new EnumMap<>(PermissionResource.class);
        if (permissions != null) {
            for (RolePermission permission : permissions) {
                indexed.put(permission.getResource(), permission);
            }
        }
        return indexed;
    }

    private static String requireNonBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new InvalidRoleException(fieldName + " must not be blank");
        }
        return value;
    }

    private static <T> T requireNonNull(T value, String fieldName) {
        if (value == null) {
            throw new InvalidRoleException(fieldName + " must not be null");
        }
        return value;
    }
}
