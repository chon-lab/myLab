package com.mylab.backend.project.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.mylab.backend.project.domain.model.ProjectDocument;

public interface ProjectDocumentRepositoryPort {
    void save(ProjectDocument document);
    Optional<ProjectDocument> findByIdAndProjectId(UUID id, UUID projectId);
    List<ProjectDocument> findAllByProjectId(UUID projectId);
    void deleteById(UUID id);
}
