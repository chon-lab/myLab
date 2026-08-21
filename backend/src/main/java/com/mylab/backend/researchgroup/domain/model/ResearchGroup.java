package com.mylab.backend.researchgroup.domain.model;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.Objects;
import java.util.UUID;

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
        this.id = Objects.requireNonNull(id, "id must not be null");
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
        this.createdAt = Objects.requireNonNull(createdAt, "createdAt must not be null");
        this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt must not be null");
        this.updatedAt = requireValidUpdatedAt(updatedAt, createdAt);
        this.deletedAt = deletedAt;
    }

    private static String requireNonBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
        return value;
    }

    private static int requireValidFormationYear(int formationYear) {
        if (formationYear < 1 || formationYear > Year.now().getValue()) {
            throw new IllegalArgumentException("formationYear must be between 1 and the current year");
        }
        return formationYear;
    }

    private static LocalDateTime requireValidUpdatedAt(
        LocalDateTime updatedAt,
        LocalDateTime createdAt
    ) {
        Objects.requireNonNull(
                updatedAt,
                "updatedAt must not be null"
        );

        if (updatedAt.isBefore(createdAt)) {
            throw new IllegalArgumentException(
                    "updatedAt must not be before createdAt"
            );
        }

        return updatedAt;
    }

}
