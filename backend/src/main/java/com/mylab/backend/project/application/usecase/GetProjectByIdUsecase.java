package com.mylab.backend.project.application.usecase;

import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.project.application.exception.ProjectNotFoundException;
import com.mylab.backend.project.application.port.in.GetProjectPort;
import com.mylab.backend.project.application.port.out.ProjectRepositoryPort;
import com.mylab.backend.project.domain.model.Project;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GetProjectByIdUsecase implements GetProjectPort {

    private final ProjectRepositoryPort repositoryPort;

    @Override
    @Transactional(readOnly = true)
    public Project get(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        log.debug("Getting project with ID: {}", id);
        return repositoryPort.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));
    }
}
