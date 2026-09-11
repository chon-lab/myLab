package com.mylab.backend.project.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.project.application.dto.UpdateProjectInput;
import com.mylab.backend.project.application.exception.ProjectNotFoundException;
import com.mylab.backend.project.application.port.in.UpdateProjectPort;
import com.mylab.backend.project.application.port.out.ProjectRepositoryPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UpdateProjectUsecase implements UpdateProjectPort {

    private final ProjectRepositoryPort repositoryPort;

    @Override
    @Transactional
    public void update(UUID id, UpdateProjectInput input) {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(input, "input must not be null");
        log.info("Updating project with ID: {}", id);

        var project = repositoryPort.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));
        project.updateDetails(
                input.name(),
                input.description(),
                input.objective(),
                input.status(),
                input.startDate(),
                input.endDate(),
                input.knowledgeAreas(),
                LocalDateTime.now());
        repositoryPort.save(project);
    }
}
