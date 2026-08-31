package com.mylab.backend.researchline.domain.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.mylab.backend.researchline.domain.exception.InvalidResearchLineException;

import lombok.Builder;
import lombok.Getter;

@Getter
public class ResearchLine {
    private final UUID id;
    private final UUID researchGroupId;
    private String name;
    private String objective;
    private List<String> keywords;
    private List<String> knowledgeAreas;
    private List<String> applicationSectors;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    @Builder
    public ResearchLine(
            UUID id,
            UUID researchGroupId,
            String name,
            String objective,
            List<String> keywords,
            List<String> knowledgeAreas,
            List<String> applicationSectors,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime deletedAt) {
        this.id = requireNonNull(id, "id");
        this.researchGroupId = requireNonNull(researchGroupId, "researchGroupId");
        this.name = requireNonBlank(name, "name");
        this.objective = requireNonBlank(objective, "objective");
        this.keywords = defaultIfNull(keywords);
        this.knowledgeAreas = defaultIfNull(knowledgeAreas);
        this.applicationSectors = defaultIfNull(applicationSectors);
        this.createdAt = requireNonNull(createdAt, "createdAt");
        this.updatedAt = requireValidUpdatedAt(updatedAt, createdAt);
        this.deletedAt = deletedAt;
    }

    private static String requireNonBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new InvalidResearchLineException(fieldName + " must not be blank");
        }
        return value;
    }

    private static <T> T requireNonNull(T value, String fieldName) {
        if (value == null) {
            throw new InvalidResearchLineException(fieldName + " must not be null");
        }
        return value;
    }

    private static List<String> defaultIfNull(List<String> values) {
        return values == null ? List.of() : List.copyOf(values);
    }

    private static LocalDateTime requireValidUpdatedAt(
        LocalDateTime updatedAt,
        LocalDateTime createdAt
    ) {
        requireNonNull(updatedAt, "updatedAt");

        if (updatedAt.isBefore(createdAt)) {
            throw new InvalidResearchLineException(
                    "updatedAt must not be before createdAt"
            );
        }

        return updatedAt;
    }

    public void updateDetails(
            String name,
            String objective,
            List<String> keywords,
            List<String> knowledgeAreas,
            List<String> applicationSectors,
            LocalDateTime occurredAt) {
        String validName = requireNonBlank(name, "name");
        String validObjective = requireNonBlank(objective, "objective");
        LocalDateTime validUpdatedAt = requireValidUpdatedAt(occurredAt, this.createdAt);

        if (validUpdatedAt.isBefore(this.updatedAt)) {
            throw new InvalidResearchLineException("updatedAt must not move backwards");
        }

        this.name = validName;
        this.objective = validObjective;
        this.keywords = defaultIfNull(keywords);
        this.knowledgeAreas = defaultIfNull(knowledgeAreas);
        this.applicationSectors = defaultIfNull(applicationSectors);
        this.updatedAt = validUpdatedAt;
    }
}
