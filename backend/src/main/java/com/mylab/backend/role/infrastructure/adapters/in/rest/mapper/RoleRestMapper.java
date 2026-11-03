package com.mylab.backend.role.infrastructure.adapters.in.rest.mapper;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.role.application.dto.CreateRoleInput;
import com.mylab.backend.role.application.dto.UpdateRoleInput;
import com.mylab.backend.role.domain.model.Role;
import com.mylab.backend.role.domain.model.RolePermission;
import com.mylab.backend.role.infrastructure.adapters.in.rest.dto.CreateRoleRequest;
import com.mylab.backend.role.infrastructure.adapters.in.rest.dto.RolePermissionDto;
import com.mylab.backend.role.infrastructure.adapters.in.rest.dto.RoleResponse;
import com.mylab.backend.role.infrastructure.adapters.in.rest.dto.UpdateRoleRequest;

@Component
public class RoleRestMapper {

    public CreateRoleInput toInput(UUID researchGroupId, CreateRoleRequest request) {
        return new CreateRoleInput(researchGroupId, request.getName(), toDomainPermissions(request.getPermissions()));
    }

    public UpdateRoleInput toInput(UpdateRoleRequest request) {
        return new UpdateRoleInput(request.getName(), toDomainPermissions(request.getPermissions()));
    }

    public RoleResponse toResponse(Role domain) {
        List<RolePermissionDto> permissions = domain.getPermissions().stream()
                .map(permission -> new RolePermissionDto(
                        permission.getResource(),
                        permission.isCanRead(),
                        permission.isCanWrite(),
                        permission.isCanDelete()))
                .toList();

        return new RoleResponse(
                domain.getId(),
                domain.getResearchGroupId(),
                domain.getName(),
                domain.isFullAccess(),
                permissions,
                domain.getCreatedAt(),
                domain.getUpdatedAt());
    }

    public List<RoleResponse> toResponseList(List<Role> domains) {
        return domains.stream().map(this::toResponse).toList();
    }

    private List<RolePermission> toDomainPermissions(List<RolePermissionDto> dtos) {
        if (dtos == null) {
            return List.of();
        }
        return dtos.stream()
                .map(dto -> RolePermission.builder()
                        .resource(dto.getResource())
                        .canRead(dto.isCanRead())
                        .canWrite(dto.isCanWrite())
                        .canDelete(dto.isCanDelete())
                        .build())
                .toList();
    }
}
