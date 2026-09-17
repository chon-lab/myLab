package com.mylab.backend.project.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.project.application.exception.ProjectNotFoundException;
import com.mylab.backend.project.application.port.in.DeleteProjectPort;
import com.mylab.backend.project.application.port.out.ProjectRepositoryPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeleteProjectUsecase implements DeleteProjectPort {

    private final ProjectRepositoryPort repositoryPort;

    @Override
    @Transactional
    public void delete(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        log.info("Archiving project with ID: {}", id);

        var project = repositoryPort.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));
        project.archive(LocalDateTime.now());
        repositoryPort.save(project);
    }
}
