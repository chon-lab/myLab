package com.mylab.backend.role.infrastructure.adapters.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.role.application.port.out.RoleRepositoryPort;
import com.mylab.backend.role.domain.model.Role;
import com.mylab.backend.role.infrastructure.adapters.out.persistence.mapper.RoleMapper;
import com.mylab.backend.role.infrastructure.adapters.out.persistence.repository.RoleJpaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class RoleJpaAdapter implements RoleRepositoryPort {

    private final RoleJpaRepository jpaRepository;
    private final RoleMapper mapper;

    @Override
    public void save(Role role) {
        log.debug("Saving role with ID: {}", role.getId());
        jpaRepository.saveAndFlush(mapper.toEntity(role));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Role> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Role> findByResearchGroupId(UUID researchGroupId) {
        return mapper.toDomainList(jpaRepository.findByResearchGroupId(researchGroupId));
    }

    @Override
    public boolean existsByResearchGroupIdAndName(UUID researchGroupId, String name) {
        return jpaRepository.existsByResearchGroupIdAndNameIgnoreCase(researchGroupId, name);
    }

    @Override
    public long countFullAccessByResearchGroupId(UUID researchGroupId) {
        return jpaRepository.countByResearchGroupIdAndFullAccessTrue(researchGroupId);
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
}
