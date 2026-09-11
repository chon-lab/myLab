package com.mylab.backend.project.infrastructure.adapters.out.persistence.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mylab.backend.project.infrastructure.adapters.out.persistence.entity.ProjectEntity;

@Repository
public interface ProjectJpaRepository extends JpaRepository<ProjectEntity, UUID> {

    Optional<ProjectEntity> findByIdAndDeletedAtIsNull(UUID id);

    List<ProjectEntity> findAllByLaboratoryIdAndDeletedAtIsNull(UUID laboratoryId);
}
