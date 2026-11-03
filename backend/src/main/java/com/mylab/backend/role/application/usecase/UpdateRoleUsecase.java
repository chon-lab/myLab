package com.mylab.backend.role.application.usecase;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.role.application.dto.UpdateRoleInput;
import com.mylab.backend.role.application.exception.DuplicateRoleNameException;
import com.mylab.backend.role.application.exception.ProtectedRoleException;
import com.mylab.backend.role.application.exception.RoleNotFoundException;
import com.mylab.backend.role.application.port.in.UpdateRolePort;
import com.mylab.backend.role.application.port.out.RoleRepositoryPort;
import com.mylab.backend.role.domain.model.Role;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UpdateRoleUsecase implements UpdateRolePort {

    private final RoleRepositoryPort repositoryPort;

    @Override
    @Transactional
    public void update(UUID id, UpdateRoleInput input) {
        Role existing = repositoryPort.findById(id).orElseThrow(() -> new RoleNotFoundException(id));

        if (existing.isFullAccess()) {
            throw new ProtectedRoleException();
        }

        if (!existing.getName().equalsIgnoreCase(input.name())
                && repositoryPort.existsByResearchGroupIdAndName(existing.getResearchGroupId(), input.name())) {
            throw new DuplicateRoleNameException(input.name());
        }

        Role updated = new Role(
                existing.getId(),
                existing.getResearchGroupId(),
                input.name(),
                false,
                input.permissions(),
                existing.getCreatedAt(),
                LocalDateTime.now());

        repositoryPort.save(updated);
        log.info("Role updated with ID: {}", id);
    }
}
