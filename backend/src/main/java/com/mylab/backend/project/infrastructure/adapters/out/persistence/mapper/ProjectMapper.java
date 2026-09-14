package com.mylab.backend.project.infrastructure.adapters.out.persistence.mapper;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mylab.backend.project.domain.model.Project;
import com.mylab.backend.project.domain.model.ProjectDocument;
import com.mylab.backend.project.infrastructure.adapters.out.persistence.entity.ProjectEntity;

@Component
public class ProjectMapper {

    public Project toDomain(ProjectEntity entity, List<ProjectDocument> documents) {
        if (entity == null) {
            return null;
        }

        return Project.builder()
                .id(entity.getId())
                .laboratoryId(entity.getLaboratoryId())
                .researchLineId(entity.getResearchLineId())
                .name(entity.getName())
                .description(entity.getDescription())
                .objective(entity.getObjective())
                .status(entity.getStatus())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .knowledgeAreas(entity.getKnowledgeAreas())
                .documents(documents)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .deletedAt(entity.getDeletedAt())
                .build();
    }

    public ProjectEntity toEntity(Project domain) {
        if (domain == null) {
            return null;
        }

        return ProjectEntity.builder()
                .id(domain.getId())
                .laboratoryId(domain.getLaboratoryId())
                .researchLineId(domain.getResearchLineId())
                .name(domain.getName())
                .description(domain.getDescription())
                .objective(domain.getObjective())
                .status(domain.getStatus())
                .startDate(domain.getStartDate())
                .endDate(domain.getEndDate())
                .knowledgeAreas(domain.getKnowledgeAreas())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .deletedAt(domain.getDeletedAt())
                .build();
    }

    public List<Project> toDomainList(List<ProjectEntity> entities, Map<UUID, List<ProjectDocument>> documentsByProjectId) {
        if (entities == null) {
            return List.of();
        }
        return entities.stream()
                .map(entity -> toDomain(entity, documentsByProjectId.getOrDefault(entity.getId(), List.of())))
                .collect(Collectors.toList());
    }
}
