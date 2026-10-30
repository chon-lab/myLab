package com.mylab.backend.role.application.usecase;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.groupmember.application.port.out.GroupMemberRepositoryPort;
import com.mylab.backend.role.application.exception.ProtectedRoleException;
import com.mylab.backend.role.application.exception.RoleInUseException;
import com.mylab.backend.role.application.exception.RoleNotFoundException;
import com.mylab.backend.role.application.port.in.DeleteRolePort;
import com.mylab.backend.role.application.port.out.RoleRepositoryPort;
import com.mylab.backend.role.domain.model.Role;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeleteRoleUsecase implements DeleteRolePort {

    private final RoleRepositoryPort repositoryPort;
    private final GroupMemberRepositoryPort groupMemberRepositoryPort;

    @Override
    @Transactional
    public void delete(UUID id) {
        Role existing = repositoryPort.findById(id).orElseThrow(() -> new RoleNotFoundException(id));

        if (existing.isFullAccess()) {
            throw new ProtectedRoleException();
        }

        long members = groupMemberRepositoryPort.countByRoleId(id);
        if (members > 0) {
            throw new RoleInUseException(members);
        }

        repositoryPort.deleteById(id);
        log.info("Role deleted with ID: {}", id);
    }
}
