package com.mylab.backend.researchgroup.domain.model;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.UUID;

import com.mylab.backend.researchgroup.domain.exception.InvalidResearchGroupException;
import com.mylab.backend.researchgroup.domain.valueobjects.GroupAddress;
import com.mylab.backend.researchgroup.domain.valueobjects.GroupContact;

import lombok.Builder;
import lombok.Getter;

@Getter
public class ResearchGroup {
    private final UUID id;
    private final String cnpqId;
    private String name;
    private String situation;
    private int formationYear;
    private java.time.LocalDateTime situationAt;
    private java.time.LocalDateTime lastSubmittedAt;
    private String predominantArea;
    private String institutionName;
    private String institutionUnit;
    private String sourceUrl;
    private String repercussions;
    private GroupAddress address;
    private GroupContact contact;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    @Builder
    public ResearchGroup(
            UUID id,
            String cnpqId,
            String name,
            String situation,
            int formationYear,
            LocalDateTime situationAt,
            LocalDateTime lastSubmittedAt,
            String predominantArea,
            String institutionName,
            String institutionUnit,
            String sourceUrl,
            String repercussions,
            GroupAddress address,
            GroupContact contact,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime deletedAt) {
        this.id = requireNonNull(id, "id");
        this.cnpqId = requireNonBlank(cnpqId, "cnpqId");
        this.name = requireNonBlank(name, "name");
        this.situation = requireNonBlank(situation, "situation");
        this.formationYear = requireValidFormationYear(formationYear);
        this.situationAt = situationAt;
        this.lastSubmittedAt = lastSubmittedAt;
        this.predominantArea = requireNonBlank(predominantArea, "predominantArea");
        this.institutionName = requireNonBlank(institutionName, "institutionName");
        this.institutionUnit = institutionUnit;
        this.sourceUrl = sourceUrl;
        this.repercussions = repercussions;
        this.address = address;
        this.contact = contact;
        this.createdAt = requireNonNull(createdAt, "createdAt");
        this.updatedAt = requireValidUpdatedAt(updatedAt, createdAt);
        this.deletedAt = deletedAt;
    }

    private static String requireNonBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new InvalidResearchGroupException(fieldName + " must not be blank");
        }
        return value;
    }

    private static <T> T requireNonNull(T value, String fieldName) {
        if (value == null) {
            throw new InvalidResearchGroupException(fieldName + " must not be null");
        }
        return value;
    }

    private static int requireValidFormationYear(int formationYear) {
        if (formationYear < 1 || formationYear > Year.now().getValue()) {
            throw new InvalidResearchGroupException("formationYear must be between 1 and the current year");
        }
        return formationYear;
    }

    private static LocalDateTime requireValidUpdatedAt(
        LocalDateTime updatedAt,
        LocalDateTime createdAt
    ) {
        requireNonNull(updatedAt, "updatedAt");

        if (updatedAt.isBefore(createdAt)) {
            throw new InvalidResearchGroupException(
                    "updatedAt must not be before createdAt"
            );
        }

        return updatedAt;
    }

    public void updateDetails(
            String name,
            String situation,
            int formationYear,
            LocalDateTime situationAt,
            LocalDateTime lastSubmittedAt,
            String predominantArea,
            String institutionName,
            String institutionUnit,
            String sourceUrl,
            String repercussions,
            GroupAddress address,
            GroupContact contact,
            LocalDateTime occurredAt) {
        String validName = requireNonBlank(name, "name");
        String validSituation = requireNonBlank(situation, "situation");
        int validFormationYear = requireValidFormationYear(formationYear);
        String validPredominantArea = requireNonBlank(predominantArea, "predominantArea");
        String validInstitutionName = requireNonBlank(institutionName, "institutionName");
        LocalDateTime validUpdatedAt = requireValidUpdatedAt(occurredAt, this.createdAt);

        if (validUpdatedAt.isBefore(this.updatedAt)) {
            throw new InvalidResearchGroupException("updatedAt must not move backwards");
        }

        this.name = validName;
        this.situation = validSituation;
        this.formationYear = validFormationYear;
        this.situationAt = situationAt;
        this.lastSubmittedAt = lastSubmittedAt;
        this.predominantArea = validPredominantArea;
        this.institutionName = validInstitutionName;
        this.institutionUnit = institutionUnit;
        this.sourceUrl = sourceUrl;
        this.repercussions = repercussions;
        this.address = address;
        this.contact = contact;
        this.updatedAt = validUpdatedAt;
    }

}
