package com.mylab.backend.project.application.usecase;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.project.application.exception.LaboratoryNotFoundException;
import com.mylab.backend.project.application.port.in.GetAllProjectsPort;
import com.mylab.backend.project.application.port.out.LaboratoryLookupPort;
import com.mylab.backend.project.application.port.out.ProjectRepositoryPort;
import com.mylab.backend.project.domain.model.Project;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GetAllProjectsUsecase implements GetAllProjectsPort {

    private final ProjectRepositoryPort repositoryPort;
    private final LaboratoryLookupPort laboratoryLookupPort;

    @Override
    @Transactional(readOnly = true)
    public List<Project> getAllByLaboratory(UUID laboratoryId) {
        Objects.requireNonNull(laboratoryId, "laboratoryId must not be null");
        log.debug("Listing projects for laboratory: {}", laboratoryId);

        if (laboratoryLookupPort.findResearchGroupIdById(laboratoryId).isEmpty()) {
            throw new LaboratoryNotFoundException(laboratoryId);
        }
        return repositoryPort.findAllByLaboratoryId(laboratoryId);
    }
}
