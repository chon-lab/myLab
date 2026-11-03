package com.mylab.backend.role.application.usecase;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.role.application.dto.CreateRoleInput;
import com.mylab.backend.role.application.exception.DuplicateRoleNameException;
import com.mylab.backend.role.application.port.in.CreateRolePort;
import com.mylab.backend.role.application.port.out.RoleRepositoryPort;
import com.mylab.backend.role.domain.model.Role;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreateRoleUsecase implements CreateRolePort {

    private final RoleRepositoryPort repositoryPort;

    @Override
    @Transactional
    public UUID create(CreateRoleInput input) {
        if (repositoryPort.existsByResearchGroupIdAndName(input.researchGroupId(), input.name())) {
            throw new DuplicateRoleNameException(input.name());
        }

        Role role = Role.create(
                input.researchGroupId(),
                input.name(),
                false,
                input.permissions(),
                LocalDateTime.now());

        repositoryPort.save(role);
        log.info("Role created with ID: {} in research group {}", role.getId(), input.researchGroupId());
        return role.getId();
    }
}
