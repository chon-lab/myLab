package com.mylab.backend.researchline.infrastructure.adapters.out.persistence.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mylab.backend.researchline.infrastructure.adapters.out.persistence.entity.ResearchLineEntity;

@Repository
public interface ResearchLineJpaRepository extends JpaRepository<ResearchLineEntity, UUID> {

    List<ResearchLineEntity> findAllByResearchGroupId(UUID researchGroupId);

    boolean existsByIdAndResearchGroupId(UUID id, UUID researchGroupId);
}
