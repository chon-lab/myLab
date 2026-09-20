package com.mylab.backend.inventory.application.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryTransferStatus;

public record InventoryTransferHistoryRecord(
        UUID id,
        UUID researchGroupId,
        UUID sourceLaboratoryId,
        String sourceLaboratoryName,
        UUID destinationLaboratoryId,
        String destinationLaboratoryName,
        LocalDate transferredAt,
        String notes,
        InventoryTransferStatus status,
        LocalDateTime reversedAt,
        String reversalReason,
        LocalDateTime createdAt,
        List<InventoryTransferHistoryItem> items
) {
    public InventoryTransferHistoryRecord {
        items = items == null ? List.of() : List.copyOf(items);
    }
}

