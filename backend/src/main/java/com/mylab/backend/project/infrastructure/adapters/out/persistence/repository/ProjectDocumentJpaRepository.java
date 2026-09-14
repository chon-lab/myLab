package com.mylab.backend.project.infrastructure.adapters.out.persistence.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mylab.backend.project.infrastructure.adapters.out.persistence.entity.ProjectDocumentEntity;

@Repository
public interface ProjectDocumentJpaRepository extends JpaRepository<ProjectDocumentEntity, UUID> {

    Optional<ProjectDocumentEntity> findByIdAndProjectId(UUID id, UUID projectId);

    List<ProjectDocumentEntity> findAllByProjectIdOrderByUploadedAtAsc(UUID projectId);
}
