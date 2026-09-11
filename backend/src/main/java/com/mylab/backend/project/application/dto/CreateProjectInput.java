package com.mylab.backend.project.application.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.mylab.backend.project.domain.model.ProjectStatus;

public record CreateProjectInput(
        UUID laboratoryId,
        UUID researchLineId,
        String name,
        String description,
        String objective,
        ProjectStatus status,
        LocalDate startDate,
        LocalDate endDate,
        List<String> knowledgeAreas
) {}
