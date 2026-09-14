package com.mylab.backend.project.application.dto;

import java.time.LocalDate;
import java.util.List;

import com.mylab.backend.project.domain.model.ProjectStatus;

public record UpdateProjectInput(
        String name,
        String description,
        String objective,
        ProjectStatus status,
        LocalDate startDate,
        LocalDate endDate,
        List<String> knowledgeAreas
) {}
