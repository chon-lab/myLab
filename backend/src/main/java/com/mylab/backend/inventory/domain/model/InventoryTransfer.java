package com.mylab.backend.inventory.domain.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;

public record InventoryTransfer(
        UUID id,
        UUID researchGroupId,
        UUID sourceLaboratoryId,
        UUID destinationLaboratoryId,
        LocalDate transferredAt,
        String notes,
        InventoryTransferStatus status,
        LocalDateTime reversedAt,
        String reversalReason,
        LocalDateTime createdAt,
        List<InventoryTransferItem> items
) {
    public InventoryTransfer {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(researchGroupId, "researchGroupId must not be null");
        Objects.requireNonNull(sourceLaboratoryId, "sourceLaboratoryId must not be null");
        Objects.requireNonNull(destinationLaboratoryId, "destinationLaboratoryId must not be null");
        Objects.requireNonNull(transferredAt, "transferredAt must not be null");
        Objects.requireNonNull(status, "status must not be null");
        Objects.requireNonNull(createdAt, "createdAt must not be null");

        if (sourceLaboratoryId.equals(destinationLaboratoryId)) {
            throw new InvalidInventoryException("Source and destination laboratories must be different");
        }
        if (items == null || items.isEmpty()) {
            throw new InvalidInventoryException("Inventory transfer must contain at least one item");
        }
        items = List.copyOf(items);
    }

    public InventoryTransfer reverse(String reason, LocalDateTime occurredAt) {
        if (this.status == InventoryTransferStatus.REVERSED) {
            throw new InvalidInventoryException("Inventory transfer is already reversed");
        }
        if (reason == null || reason.isBlank()) {
            throw new InvalidInventoryException("Reversal reason must not be blank");
        }
        if (occurredAt == null) {
            throw new InvalidInventoryException("Reversed at timestamp must not be null");
        }
        return new InventoryTransfer(
                this.id,
                this.researchGroupId,
                this.sourceLaboratoryId,
                this.destinationLaboratoryId,
                this.transferredAt,
                this.notes,
                InventoryTransferStatus.REVERSED,
                occurredAt,
                reason,
                this.createdAt,
                this.items
        );
    }
}

