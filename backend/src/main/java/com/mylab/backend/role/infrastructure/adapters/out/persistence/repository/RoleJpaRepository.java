package com.mylab.backend.role.infrastructure.adapters.out.persistence.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mylab.backend.role.infrastructure.adapters.out.persistence.entity.RoleEntity;

@Repository
public interface RoleJpaRepository extends JpaRepository<RoleEntity, UUID> {

    List<RoleEntity> findByResearchGroupId(UUID researchGroupId);

    boolean existsByResearchGroupIdAndNameIgnoreCase(UUID researchGroupId, String name);

    long countByResearchGroupIdAndFullAccessTrue(UUID researchGroupId);
}
