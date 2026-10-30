package com.mylab.backend.role.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.mylab.backend.role.domain.model.Role;

public interface RoleRepositoryPort {
    void save(Role role);
    Optional<Role> findById(UUID id);
    List<Role> findByResearchGroupId(UUID researchGroupId);
    boolean existsByResearchGroupIdAndName(UUID researchGroupId, String name);
    long countFullAccessByResearchGroupId(UUID researchGroupId);
    void deleteById(UUID id);
}
