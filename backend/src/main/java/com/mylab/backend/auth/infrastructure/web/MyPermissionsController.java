package com.mylab.backend.auth.infrastructure.web;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.mylab.backend.auth.application.exception.ForbiddenException;
import com.mylab.backend.auth.infrastructure.web.dto.MyPermissionsResponse;
import com.mylab.backend.auth.infrastructure.CurrentPersonProvider;
import com.mylab.backend.groupmember.application.port.out.GroupMemberRepositoryPort;
import com.mylab.backend.groupmember.domain.model.GroupMember;
import com.mylab.backend.role.application.port.out.RoleRepositoryPort;
import com.mylab.backend.role.domain.model.Role;
import com.mylab.backend.role.infrastructure.adapters.in.rest.dto.RolePermissionDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class MyPermissionsController {

    private final CurrentPersonProvider currentPersonProvider;
    private final GroupMemberRepositoryPort groupMemberRepositoryPort;
    private final RoleRepositoryPort roleRepositoryPort;

    @GetMapping("/api/v1/me/research-groups/{researchGroupId}/permissions")
    public MyPermissionsResponse myPermissions(@PathVariable UUID researchGroupId) {
        UUID personId = currentPersonProvider.current().getId();

        GroupMember member = groupMemberRepositoryPort
                .findByPersonIdAndResearchGroupId(personId, researchGroupId)
                .filter(GroupMember::isActive)
                .orElseThrow(() -> new ForbiddenException("Você não é membro ativo deste grupo de pesquisa."));

        if (member.getRoleId() == null) {
            return new MyPermissionsResponse(researchGroupId, null, false, List.of());
        }

        Role role = roleRepositoryPort.findById(member.getRoleId()).orElse(null);
        if (role == null) {
            return new MyPermissionsResponse(researchGroupId, null, false, List.of());
        }

        List<RolePermissionDto> permissions = role.getPermissions().stream()
                .map(permission -> new RolePermissionDto(
                        permission.getResource(),
                        permission.isCanRead(),
                        permission.isCanWrite(),
                        permission.isCanDelete()))
                .toList();

        return new MyPermissionsResponse(researchGroupId, role.getName(), role.isFullAccess(), permissions);
    }
}
