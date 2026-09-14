package com.mylab.backend.project.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.project.application.dto.CreateProjectInput;
import com.mylab.backend.project.application.exception.LaboratoryNotFoundException;
import com.mylab.backend.project.application.exception.ResearchLineNotFoundException;
import com.mylab.backend.project.application.port.in.CreateProjectPort;
import com.mylab.backend.project.application.port.out.LaboratoryLookupPort;
import com.mylab.backend.project.application.port.out.ProjectRepositoryPort;
import com.mylab.backend.project.application.port.out.ResearchLineLookupPort;
import com.mylab.backend.project.domain.model.Project;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreateProjectUsecase implements CreateProjectPort {

    private final ProjectRepositoryPort repositoryPort;
    private final LaboratoryLookupPort laboratoryLookupPort;
    private final ResearchLineLookupPort researchLineLookupPort;

    @Override
    @Transactional
    public UUID create(CreateProjectInput input) {
        Objects.requireNonNull(input, "input must not be null");
        Objects.requireNonNull(input.laboratoryId(), "laboratoryId must not be null");
        Objects.requireNonNull(input.researchLineId(), "researchLineId must not be null");
        log.info("Creating project for laboratory: {}", input.laboratoryId());

        UUID researchGroupId = laboratoryLookupPort.findResearchGroupIdById(input.laboratoryId())
                .orElseThrow(() -> new LaboratoryNotFoundException(input.laboratoryId()));

        if (!researchLineLookupPort.existsByIdAndResearchGroupId(input.researchLineId(), researchGroupId)) {
            throw new ResearchLineNotFoundException(input.researchLineId());
        }

        LocalDateTime now = LocalDateTime.now();
        Project project = Project.builder()
                .id(UUID.randomUUID())
                .laboratoryId(input.laboratoryId())
                .researchLineId(input.researchLineId())
                .name(input.name())
                .description(input.description())
                .objective(input.objective())
                .status(input.status())
                .startDate(input.startDate())
                .endDate(input.endDate())
                .knowledgeAreas(input.knowledgeAreas())
                .createdAt(now)
                .updatedAt(now)
                .build();

        repositoryPort.save(project);
        log.info("Project created successfully with ID: {}", project.getId());
        return project.getId();
    }
}
