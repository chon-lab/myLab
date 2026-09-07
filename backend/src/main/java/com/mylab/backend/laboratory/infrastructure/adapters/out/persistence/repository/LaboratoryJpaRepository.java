package com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mylab.backend.laboratory.infrastructure.adapters.out.persistence.entity.LaboratoryEntity;

@Repository
public interface LaboratoryJpaRepository extends JpaRepository<LaboratoryEntity, UUID> {

    Optional<LaboratoryEntity> findByIdAndDeletedAtIsNull(UUID id);

    List<LaboratoryEntity> findAllByResearchGroupIdAndDeletedAtIsNull(UUID researchGroupId);
}
