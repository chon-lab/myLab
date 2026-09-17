package com.mylab.backend.project.infrastructure.adapters.in.rest.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.mylab.backend.project.domain.model.ProjectStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectResponse {
    private UUID id;
    private UUID laboratoryId;
    private UUID researchLineId;
    private String name;
    private String description;
    private String objective;
    private ProjectStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<String> knowledgeAreas;
    private List<ProjectDocumentResponse> documents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
