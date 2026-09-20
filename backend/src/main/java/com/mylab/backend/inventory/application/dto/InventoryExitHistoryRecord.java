package com.mylab.backend.inventory.application.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryExitStatus;
import com.mylab.backend.inventory.domain.model.InventoryExitType;

public record InventoryExitHistoryRecord(
        UUID id,
        UUID researchGroupId,
        UUID laboratoryId,
        String laboratoryName,
        InventoryExitType type,
        LocalDate occurredAt,
        String notes,
        InventoryExitStatus status,
        LocalDateTime reversedAt,
        String reversalReason,
        LocalDateTime createdAt,
        List<InventoryExitHistoryItem> items
) {
    public InventoryExitHistoryRecord {
        items = items == null ? List.of() : List.copyOf(items);
    }
}

