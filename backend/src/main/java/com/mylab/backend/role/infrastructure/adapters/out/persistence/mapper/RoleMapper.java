package com.mylab.backend.role.infrastructure.adapters.out.persistence.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.mylab.backend.role.domain.model.Role;
import com.mylab.backend.role.domain.model.RolePermission;
import com.mylab.backend.role.infrastructure.adapters.out.persistence.entity.RoleEntity;
import com.mylab.backend.role.infrastructure.adapters.out.persistence.entity.RolePermissionEmbeddable;

@Component
public class RoleMapper {

    public RoleEntity toEntity(Role domain) {
        List<RolePermissionEmbeddable> permissions = domain.getPermissions().stream()
                .map(permission -> new RolePermissionEmbeddable(
                        permission.getResource(),
                        permission.isCanRead(),
                        permission.isCanWrite(),
                        permission.isCanDelete()))
                .toList();

        return RoleEntity.builder()
                .id(domain.getId())
                .researchGroupId(domain.getResearchGroupId())
                .name(domain.getName())
                .fullAccess(domain.isFullAccess())
                .permissions(permissions)
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }

    public Role toDomain(RoleEntity entity) {
        List<RolePermission> permissions = entity.getPermissions().stream()
                .map(permission -> RolePermission.builder()
                        .resource(permission.getResource())
                        .canRead(permission.isCanRead())
                        .canWrite(permission.isCanWrite())
                        .canDelete(permission.isCanDelete())
                        .build())
                .toList();

        return new Role(
                entity.getId(),
                entity.getResearchGroupId(),
                entity.getName(),
                entity.isFullAccess(),
                permissions,
                entity.getCreatedAt(),
                entity.getUpdatedAt());
    }

    public List<Role> toDomainList(List<RoleEntity> entities) {
        return entities.stream().map(this::toDomain).toList();
    }
}
