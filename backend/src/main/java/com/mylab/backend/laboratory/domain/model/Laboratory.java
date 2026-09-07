package com.mylab.backend.laboratory.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

import com.mylab.backend.laboratory.domain.exception.InvalidLaboratoryException;
import com.mylab.backend.laboratory.domain.valueobject.LaboratoryAddress;

import lombok.Builder;
import lombok.Getter;

@Getter
public class Laboratory {
    private final UUID id;
    private final UUID researchGroupId;
    private String name;
    private String description;
    private LaboratoryStatus status;
    private LaboratoryAddress address;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    @Builder
    public Laboratory(
            UUID id,
            UUID researchGroupId,
            String name,
            String description,
            LaboratoryStatus status,
            LaboratoryAddress address,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime deletedAt) {
        this.id = requireNonNull(id, "id");
        this.researchGroupId = requireNonNull(researchGroupId, "researchGroupId");
        this.name = validateName(name);
        this.description = validateDescription(description);
        this.status = status == null ? LaboratoryStatus.ACTIVE : status;
        this.address = normalizeAddress(address);
        this.createdAt = requireNonNull(createdAt, "createdAt");
        this.updatedAt = requireValidUpdatedAt(updatedAt, createdAt);
        this.deletedAt = deletedAt;
    }

    private static String validateName(String value) {
        if (value == null || value.isBlank()) {
            throw new InvalidLaboratoryException("name must not be blank");
        }
        if (value.length() > 255) {
            throw new InvalidLaboratoryException("name must not exceed 255 characters");
        }
        return value;
    }

    private static String validateDescription(String value) {
        if (value != null && value.length() > 1000) {
            throw new InvalidLaboratoryException("description must not exceed 1000 characters");
        }
        return value;
    }

    private static <T> T requireNonNull(T value, String fieldName) {
        if (value == null) {
            throw new InvalidLaboratoryException(fieldName + " must not be null");
        }
        return value;
    }

    private static LocalDateTime requireValidUpdatedAt(LocalDateTime updatedAt, LocalDateTime createdAt) {
        requireNonNull(updatedAt, "updatedAt");
        if (updatedAt.isBefore(createdAt)) {
            throw new InvalidLaboratoryException("updatedAt must not be before createdAt");
        }
        return updatedAt;
    }

    public void updateDetails(
            String name,
            String description,
            LaboratoryStatus status,
            LaboratoryAddress address,
            LocalDateTime occurredAt) {
        String validName = validateName(name);
        String validDescription = validateDescription(description);
        LaboratoryStatus validStatus = requireNonNull(status, "status");
        LocalDateTime validUpdatedAt = requireValidUpdatedAt(occurredAt, createdAt);
        if (validUpdatedAt.isBefore(updatedAt)) {
            throw new InvalidLaboratoryException("updatedAt must not move backwards");
        }
        this.name = validName;
        this.description = validDescription;
        this.status = validStatus;
        this.address = normalizeAddress(address);
        this.updatedAt = validUpdatedAt;
    }

    public void archive(LocalDateTime occurredAt) {
        LocalDateTime validUpdatedAt = requireValidUpdatedAt(occurredAt, createdAt);
        if (deletedAt != null) {
            throw new InvalidLaboratoryException("laboratory is already archived");
        }
        if (validUpdatedAt.isBefore(updatedAt)) {
            throw new InvalidLaboratoryException("updatedAt must not move backwards");
        }
        this.deletedAt = validUpdatedAt;
        this.updatedAt = validUpdatedAt;
    }

    private static LaboratoryAddress normalizeAddress(LaboratoryAddress address) {
        return address == null || address.isEmpty() ? null : address;
    }
}
