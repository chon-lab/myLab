package com.mylab.backend.role.application.usecase;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.role.application.exception.RoleNotFoundException;
import com.mylab.backend.role.application.port.in.GetRolesPort;
import com.mylab.backend.role.application.port.out.RoleRepositoryPort;
import com.mylab.backend.role.domain.model.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetRolesUsecase implements GetRolesPort {

    private final RoleRepositoryPort repositoryPort;

    @Override
    @Transactional(readOnly = true)
    public List<Role> getByResearchGroup(UUID researchGroupId) {
        return repositoryPort.findByResearchGroupId(researchGroupId);
    }

    @Override
    @Transactional(readOnly = true)
    public Role get(UUID id) {
        return repositoryPort.findById(id).orElseThrow(() -> new RoleNotFoundException(id));
    }
}
