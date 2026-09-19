package com.mylab.backend.inventory.domain.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;

public record InventoryExit(
        UUID id,
        UUID researchGroupId,
        UUID laboratoryId,
        InventoryExitType type,
        LocalDate occurredAt,
        String notes,
        InventoryExitStatus status,
        LocalDateTime reversedAt,
        String reversalReason,
        LocalDateTime createdAt,
        List<InventoryExitItem> items
) {
    public InventoryExit {
        if (id == null || researchGroupId == null || laboratoryId == null || type == null
                || status == null || createdAt == null || occurredAt == null) {
            throw new InvalidInventoryException("Required inventory exit fields must not be null");
        }
        if (notes != null && notes.length() > 3000) {
            throw new InvalidInventoryException("notes must not exceed 3000 characters");
        }
        if (status == InventoryExitStatus.CONFIRMED && (reversedAt != null || reversalReason != null)) {
            throw new InvalidInventoryException("a confirmed exit cannot contain reversal data");
        }
        if (status == InventoryExitStatus.REVERSED
                && (reversedAt == null || reversalReason == null || reversalReason.isBlank())) {
            throw new InvalidInventoryException("a reversed exit requires reversal date and reason");
        }
        if (reversalReason != null) {
            reversalReason = reversalReason.trim();
            if (reversalReason.length() > 2000) {
                throw new InvalidInventoryException("reversalReason must not exceed 2000 characters");
            }
        }
        items = items == null ? List.of() : List.copyOf(items);
        if (items.isEmpty()) {
            throw new InvalidInventoryException("At least one exit item is required");
        }
    }

    public InventoryExit reverse(String reason, LocalDateTime occurredAt) {
        if (this.status == InventoryExitStatus.REVERSED) {
            throw new InvalidInventoryException("inventory exit is already reversed");
        }
        if (reason == null || reason.isBlank()) {
            throw new InvalidInventoryException("reversal reason must not be blank");
        }
        if (occurredAt == null) {
            throw new InvalidInventoryException("reversal timestamp must not be null");
        }
        return new InventoryExit(
                this.id,
                this.researchGroupId,
                this.laboratoryId,
                this.type,
                this.occurredAt,
                this.notes,
                InventoryExitStatus.REVERSED,
                occurredAt,
                reason,
                this.createdAt,
                this.items
        );
    }
}

