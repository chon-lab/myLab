package com.mylab.backend.inventory.domain.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;

public record InventoryMovement(UUID id, UUID researchGroupId, InventoryMovementType type,
                                InventoryMovementReason reason, InventoryPurchaseType purchaseType,
                                UUID sourceLaboratoryId,
                                UUID destinationLaboratoryId, String externalSourceName,
                                LocalDate occurredAt, String notes, InventoryMovementStatus status,
                                LocalDateTime reversedAt, String reversalReason,
                                LocalDateTime createdAt, List<InventoryMovementItem> items) {
    public InventoryMovement {
        if (id == null || researchGroupId == null || type == null || reason == null
                || occurredAt == null || status == null || createdAt == null) {
            throw new InvalidInventoryException("Required movement fields must not be null");
        }
        switch (type) {
            case ENTRY -> {
                if (sourceLaboratoryId != null || destinationLaboratoryId == null
                        || !(reason == InventoryMovementReason.PURCHASE
                        || reason == InventoryMovementReason.DONATION)) {
                    throw new InvalidInventoryException("Invalid entry route or reason");
                }
                if ((reason == InventoryMovementReason.PURCHASE && purchaseType == null)
                        || (reason == InventoryMovementReason.DONATION && purchaseType != null)) {
                    throw new InvalidInventoryException("purchaseType is required only for purchase entries");
                }
                if (externalSourceName == null || externalSourceName.isBlank()) {
                    throw new InvalidInventoryException("externalSourceName is required for entries");
                }
                externalSourceName = externalSourceName.trim();
                if (externalSourceName.length() > 255) {
                    throw new InvalidInventoryException("externalSourceName must not exceed 255 characters");
                }
            }
            case EXIT -> {
                if (purchaseType != null || sourceLaboratoryId == null || destinationLaboratoryId != null || externalSourceName != null
                        || !(reason == InventoryMovementReason.CONSUMPTION
                        || reason == InventoryMovementReason.DISPOSAL
                        || reason == InventoryMovementReason.LOSS)) {
                    throw new InvalidInventoryException("Invalid exit route or reason");
                }
            }
            case TRANSFER -> {
                if (purchaseType != null || sourceLaboratoryId == null || destinationLaboratoryId == null || externalSourceName != null
                        || sourceLaboratoryId.equals(destinationLaboratoryId)
                        || reason != InventoryMovementReason.INTERNAL_TRANSFER) {
                    throw new InvalidInventoryException("Invalid transfer route or reason");
                }
            }
        }
        if (notes != null && notes.length() > 3000) {
            throw new InvalidInventoryException("notes must not exceed 3000 characters");
        }
        if (status == InventoryMovementStatus.CONFIRMED && (reversedAt != null || reversalReason != null)) {
            throw new InvalidInventoryException("Confirmed movement cannot contain reversal data");
        }
        if (status == InventoryMovementStatus.REVERSED
                && (reversedAt == null || reversalReason == null || reversalReason.isBlank())) {
            throw new InvalidInventoryException("Reversed movement requires a date and reason");
        }
        if (reversalReason != null) {
            reversalReason = reversalReason.trim();
            if (reversalReason.length() > 2000) {
                throw new InvalidInventoryException("reversalReason must not exceed 2000 characters");
            }
        }
        if (items == null || items.isEmpty()) {
            throw new InvalidInventoryException("At least one movement item is required");
        }
        items = List.copyOf(items);
        Set<UUID> seen = new HashSet<>();
        for (InventoryMovementItem item : items) {
            if (item == null || !seen.add(item.inventoryItemId())) {
                throw new InvalidInventoryException("Inventory item may appear only once in a movement");
            }
        }
    }

    public InventoryMovement reverse(String reason, LocalDateTime at) {
        if (status == InventoryMovementStatus.REVERSED) {
            throw new InvalidInventoryException("Inventory movement is already reversed");
        }
        if (reason == null || reason.isBlank() || at == null) {
            throw new InvalidInventoryException("Reversal reason and date are required");
        }
        return new InventoryMovement(id, researchGroupId, type, this.reason, purchaseType, sourceLaboratoryId,
                destinationLaboratoryId, externalSourceName, occurredAt, notes,
                InventoryMovementStatus.REVERSED, at, reason.trim(), createdAt, items);
    }
}
