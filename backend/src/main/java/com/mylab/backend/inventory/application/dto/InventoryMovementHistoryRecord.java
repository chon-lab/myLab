package com.mylab.backend.inventory.application.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryMovementReason;
import com.mylab.backend.inventory.domain.model.InventoryMovementStatus;
import com.mylab.backend.inventory.domain.model.InventoryMovementType;
import com.mylab.backend.inventory.domain.model.InventoryPurchaseType;

public record InventoryMovementHistoryRecord(UUID id, UUID researchGroupId, InventoryMovementType movementType,
        InventoryMovementReason reason, InventoryPurchaseType purchaseType,
        UUID sourceLaboratoryId, String sourceLaboratoryName,
        UUID destinationLaboratoryId, String destinationLaboratoryName, String externalSourceName,
        LocalDate occurredAt, String notes, InventoryMovementStatus status, LocalDateTime reversedAt,
        String reversalReason, LocalDateTime createdAt, List<InventoryMovementHistoryItem> items) {
    public InventoryMovementHistoryRecord {
        items = List.copyOf(items);
    }
}
