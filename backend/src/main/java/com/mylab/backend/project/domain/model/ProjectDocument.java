package com.mylab.backend.project.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

import com.mylab.backend.project.domain.exception.InvalidProjectDocumentException;

import lombok.Builder;
import lombok.Getter;

@Getter
public class ProjectDocument {
    private final UUID id;
    private final UUID projectId;
    private final String fileName;
    private final String storedPath;
    private final String contentType;
    private final long sizeBytes;
    private final LocalDateTime uploadedAt;

    @Builder
    public ProjectDocument(
            UUID id,
            UUID projectId,
            String fileName,
            String storedPath,
            String contentType,
            long sizeBytes,
            LocalDateTime uploadedAt) {
        this.id = requireNonNull(id, "id");
        this.projectId = requireNonNull(projectId, "projectId");
        this.fileName = requireNonBlank(fileName, "fileName");
        this.storedPath = requireNonBlank(storedPath, "storedPath");
        this.contentType = requireNonBlank(contentType, "contentType");
        if (sizeBytes <= 0) {
            throw new InvalidProjectDocumentException("sizeBytes must be greater than zero");
        }
        this.sizeBytes = sizeBytes;
        this.uploadedAt = requireNonNull(uploadedAt, "uploadedAt");
    }

    private static String requireNonBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new InvalidProjectDocumentException(fieldName + " must not be blank");
        }
        return value;
    }

    private static <T> T requireNonNull(T value, String fieldName) {
        if (value == null) {
            throw new InvalidProjectDocumentException(fieldName + " must not be null");
        }
        return value;
    }
}
