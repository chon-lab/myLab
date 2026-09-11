package com.mylab.backend.project.infrastructure.adapters.out.persistence.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mylab.backend.project.domain.model.ProjectDocument;
import com.mylab.backend.project.infrastructure.adapters.out.persistence.entity.ProjectDocumentEntity;

@Component
public class ProjectDocumentMapper {

    public ProjectDocument toDomain(ProjectDocumentEntity entity) {
        if (entity == null) {
            return null;
        }
        return ProjectDocument.builder()
                .id(entity.getId())
                .projectId(entity.getProjectId())
                .fileName(entity.getFileName())
                .storedPath(entity.getStoredPath())
                .contentType(entity.getContentType())
                .sizeBytes(entity.getSizeBytes())
                .uploadedAt(entity.getUploadedAt())
                .build();
    }

    public ProjectDocumentEntity toEntity(ProjectDocument domain) {
        if (domain == null) {
            return null;
        }
        return ProjectDocumentEntity.builder()
                .id(domain.getId())
                .projectId(domain.getProjectId())
                .fileName(domain.getFileName())
                .storedPath(domain.getStoredPath())
                .contentType(domain.getContentType())
                .sizeBytes(domain.getSizeBytes())
                .uploadedAt(domain.getUploadedAt())
                .build();
    }

    public List<ProjectDocument> toDomainList(List<ProjectDocumentEntity> entities) {
        if (entities == null) {
            return List.of();
        }
        return entities.stream().map(this::toDomain).collect(Collectors.toList());
    }
}
