package com.mylab.backend.inventory.domain.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;
import lombok.Builder;
import lombok.Getter;

@Getter
public class InventoryItem {
    private final UUID id;
    private final UUID researchGroupId;
    private String name;
    private String description;
    private InventoryItemType itemType;
    private InventoryUnitOfMeasure unitOfMeasure;
    private BigDecimal referenceUnitValue;
    private boolean active;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    @Builder
    public InventoryItem(UUID id, UUID researchGroupId, String name, String description,
            InventoryItemType itemType, InventoryUnitOfMeasure unitOfMeasure,
            BigDecimal referenceUnitValue, boolean active, LocalDateTime createdAt,
            LocalDateTime updatedAt, LocalDateTime deletedAt) {
        this.id = required(id, "id");
        this.researchGroupId = required(researchGroupId, "researchGroupId");
        this.name = validName(name);
        this.description = validDescription(description);
        this.itemType = required(itemType, "itemType");
        this.unitOfMeasure = required(unitOfMeasure, "unitOfMeasure");
        this.referenceUnitValue = validValue(referenceUnitValue);
        this.active = active;
        this.createdAt = required(createdAt, "createdAt");
        this.updatedAt = validTimestamp(updatedAt, createdAt);
        this.deletedAt = deletedAt;
    }

    public void updateDetails(String name, String description, BigDecimal referenceUnitValue,
            LocalDateTime occurredAt) {
        LocalDateTime timestamp = validTimestamp(occurredAt, createdAt);
        if (timestamp.isBefore(updatedAt)) throw invalid("updatedAt must not move backwards");
        this.name = validName(name);
        this.description = validDescription(description);
        this.referenceUnitValue = validValue(referenceUnitValue);
        this.updatedAt = timestamp;
    }

    public void archive(LocalDateTime occurredAt) {
        if (deletedAt != null) throw invalid("inventory item is already archived");
        LocalDateTime timestamp = validTimestamp(occurredAt, createdAt);
        if (timestamp.isBefore(updatedAt)) throw invalid("updatedAt must not move backwards");
        this.active = false;
        this.deletedAt = timestamp;
        this.updatedAt = timestamp;
    }

    private static String validName(String value) {
        if (value == null || value.isBlank()) throw invalid("name must not be blank");
        if (value.length() > 255) throw invalid("name must not exceed 255 characters");
        return value.trim();
    }
    private static String validDescription(String value) {
        if (value != null && value.length() > 2000) throw invalid("description must not exceed 2000 characters");
        return value;
    }
    private static BigDecimal validValue(BigDecimal value) {
        if (value == null || value.signum() <= 0) throw invalid("referenceUnitValue must be greater than zero");
        return value;
    }
    private static LocalDateTime validTimestamp(LocalDateTime value, LocalDateTime createdAt) {
        required(value, "updatedAt");
        if (value.isBefore(createdAt)) throw invalid("updatedAt must not be before createdAt");
        return value;
    }
    private static <T> T required(T value, String field) {
        if (value == null) throw invalid(field + " must not be null");
        return value;
    }
    private static InvalidInventoryException invalid(String message) { return new InvalidInventoryException(message); }
}
