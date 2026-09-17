package com.mylab.backend.project.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.mylab.backend.project.domain.model.Project;

public interface ProjectRepositoryPort {
    void save(Project project);
    Optional<Project> findById(UUID id);
    List<Project> findAllByLaboratoryId(UUID laboratoryId);
}
