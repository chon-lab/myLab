package com.mylab.backend.project.domain.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.mylab.backend.project.domain.exception.InvalidProjectException;

import lombok.Builder;
import lombok.Getter;

@Getter
public class Project {
    private final UUID id;
    private final UUID laboratoryId;
    private final UUID researchLineId;
    private String name;
    private String description;
    private String objective;
    private ProjectStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<String> knowledgeAreas;
    private List<ProjectDocument> documents;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    @Builder
    public Project(
            UUID id,
            UUID laboratoryId,
            UUID researchLineId,
            String name,
            String description,
            String objective,
            ProjectStatus status,
            LocalDate startDate,
            LocalDate endDate,
            List<String> knowledgeAreas,
            List<ProjectDocument> documents,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime deletedAt) {
        this.id = requireNonNull(id, "id");
        this.laboratoryId = requireNonNull(laboratoryId, "laboratoryId");
        this.researchLineId = requireNonNull(researchLineId, "researchLineId");
        this.name = validateName(name);
        this.description = validateDescription(description);
        this.objective = requireNonBlank(objective, "objective");
        this.status = status == null ? ProjectStatus.EM_ANDAMENTO : status;
        this.startDate = requireNonNull(startDate, "startDate");
        this.endDate = validateEndDate(endDate, this.startDate);
        this.knowledgeAreas = defaultIfNull(knowledgeAreas);
        this.documents = documents == null ? List.of() : List.copyOf(documents);
        this.createdAt = requireNonNull(createdAt, "createdAt");
        this.updatedAt = requireValidUpdatedAt(updatedAt, createdAt);
        this.deletedAt = deletedAt;
    }

    private static String validateName(String value) {
        if (value == null || value.isBlank()) {
            throw new InvalidProjectException("name must not be blank");
        }
        if (value.length() > 255) {
            throw new InvalidProjectException("name must not exceed 255 characters");
        }
        return value;
    }

    private static String validateDescription(String value) {
        if (value != null && value.length() > 1000) {
            throw new InvalidProjectException("description must not exceed 1000 characters");
        }
        return value;
    }

    private static String requireNonBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new InvalidProjectException(fieldName + " must not be blank");
        }
        return value;
    }

    private static <T> T requireNonNull(T value, String fieldName) {
        if (value == null) {
            throw new InvalidProjectException(fieldName + " must not be null");
        }
        return value;
    }

    private static LocalDate validateEndDate(LocalDate endDate, LocalDate startDate) {
        if (endDate != null && endDate.isBefore(startDate)) {
            throw new InvalidProjectException("endDate must not be before startDate");
        }
        return endDate;
    }

    private static List<String> defaultIfNull(List<String> values) {
        return values == null ? List.of() : List.copyOf(values);
    }

    private static LocalDateTime requireValidUpdatedAt(LocalDateTime updatedAt, LocalDateTime createdAt) {
        requireNonNull(updatedAt, "updatedAt");
        if (updatedAt.isBefore(createdAt)) {
            throw new InvalidProjectException("updatedAt must not be before createdAt");
        }
        return updatedAt;
    }

    public void updateDetails(
            String name,
            String description,
            String objective,
            ProjectStatus status,
            LocalDate startDate,
            LocalDate endDate,
            List<String> knowledgeAreas,
            LocalDateTime occurredAt) {
        String validName = validateName(name);
        String validDescription = validateDescription(description);
        String validObjective = requireNonBlank(objective, "objective");
        ProjectStatus validStatus = requireNonNull(status, "status");
        LocalDate validStartDate = requireNonNull(startDate, "startDate");
        LocalDate validEndDate = validateEndDate(endDate, validStartDate);
        LocalDateTime validUpdatedAt = requireValidUpdatedAt(occurredAt, createdAt);
        if (validUpdatedAt.isBefore(updatedAt)) {
            throw new InvalidProjectException("updatedAt must not move backwards");
        }

        this.name = validName;
        this.description = validDescription;
        this.objective = validObjective;
        this.status = validStatus;
        this.startDate = validStartDate;
        this.endDate = validEndDate;
        this.knowledgeAreas = defaultIfNull(knowledgeAreas);
        this.updatedAt = validUpdatedAt;
    }

    public void archive(LocalDateTime occurredAt) {
        LocalDateTime validUpdatedAt = requireValidUpdatedAt(occurredAt, createdAt);
        if (deletedAt != null) {
            throw new InvalidProjectException("project is already archived");
        }
        if (validUpdatedAt.isBefore(updatedAt)) {
            throw new InvalidProjectException("updatedAt must not move backwards");
        }
        this.deletedAt = validUpdatedAt;
        this.updatedAt = validUpdatedAt;
    }
}
