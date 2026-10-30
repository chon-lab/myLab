package com.mylab.backend.auth.application;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.mylab.backend.auth.application.exception.ForbiddenException;
import com.mylab.backend.groupmember.application.port.out.GroupMemberRepositoryPort;
import com.mylab.backend.groupmember.domain.model.GroupMember;
import com.mylab.backend.role.application.port.out.RoleRepositoryPort;
import com.mylab.backend.role.domain.model.PermissionAction;
import com.mylab.backend.role.domain.model.PermissionResource;
import com.mylab.backend.role.domain.model.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PermissionChecker {

    private final GroupMemberRepositoryPort groupMemberRepositoryPort;
    private final RoleRepositoryPort roleRepositoryPort;

    public boolean can(UUID personId, UUID researchGroupId, PermissionResource resource, PermissionAction action) {
        GroupMember member = groupMemberRepositoryPort
                .findByPersonIdAndResearchGroupId(personId, researchGroupId)
                .orElse(null);

        if (member == null || !member.isActive() || member.getRoleId() == null) {
            return false;
        }

        Role role = roleRepositoryPort.findById(member.getRoleId()).orElse(null);
        return role != null && role.can(resource, action);
    }

    public void require(UUID personId, UUID researchGroupId, PermissionResource resource, PermissionAction action) {
        if (!can(personId, researchGroupId, resource, action)) {
            throw new ForbiddenException(
                    "Sem permissão de " + action + " em " + resource + " neste grupo de pesquisa.");
        }
    }
}
