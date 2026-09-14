package com.mylab.backend.project.infrastructure.adapters.in.rest.mapper;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mylab.backend.project.application.dto.CreateProjectInput;
import com.mylab.backend.project.application.dto.UpdateProjectInput;
import com.mylab.backend.project.domain.model.Project;
import com.mylab.backend.project.domain.model.ProjectDocument;
import com.mylab.backend.project.infrastructure.adapters.in.rest.dto.CreateProjectRequest;
import com.mylab.backend.project.infrastructure.adapters.in.rest.dto.ProjectDocumentResponse;
import com.mylab.backend.project.infrastructure.adapters.in.rest.dto.ProjectResponse;
import com.mylab.backend.project.infrastructure.adapters.in.rest.dto.UpdateProjectRequest;

@Component
public class ProjectRestMapper {

    public CreateProjectInput toInput(UUID laboratoryId, CreateProjectRequest request) {
        return new CreateProjectInput(
                laboratoryId,
                request.getResearchLineId(),
                request.getName(),
                request.getDescription(),
                request.getObjective(),
                request.getStatus(),
                request.getStartDate(),
                request.getEndDate(),
                request.getKnowledgeAreas()
        );
    }

    public UpdateProjectInput toInput(UpdateProjectRequest request) {
        return new UpdateProjectInput(
                request.getName(),
                request.getDescription(),
                request.getObjective(),
                request.getStatus(),
                request.getStartDate(),
                request.getEndDate(),
                request.getKnowledgeAreas()
        );
    }

    public ProjectResponse toResponse(Project domain) {
        if (domain == null) {
            return null;
        }
        return new ProjectResponse(
                domain.getId(),
                domain.getLaboratoryId(),
                domain.getResearchLineId(),
                domain.getName(),
                domain.getDescription(),
                domain.getObjective(),
                domain.getStatus(),
                domain.getStartDate(),
                domain.getEndDate(),
                domain.getKnowledgeAreas(),
                toDocumentResponseList(domain.getDocuments()),
                domain.getCreatedAt(),
                domain.getUpdatedAt()
        );
    }

    public List<ProjectResponse> toResponseList(List<Project> domains) {
        if (domains == null) {
            return List.of();
        }
        return domains.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private ProjectDocumentResponse toResponse(ProjectDocument document) {
        return new ProjectDocumentResponse(
                document.getId(),
                document.getFileName(),
                document.getContentType(),
                document.getSizeBytes(),
                document.getUploadedAt()
        );
    }

    private List<ProjectDocumentResponse> toDocumentResponseList(List<ProjectDocument> documents) {
        if (documents == null) {
            return List.of();
        }
        return documents.stream().map(this::toResponse).collect(Collectors.toList());
    }
}
