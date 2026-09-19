package com.mylab.backend.inventory.application.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryEntrySource;
import com.mylab.backend.inventory.domain.model.InventoryEntryStatus;

public record InventoryEntryHistoryRecord(
        UUID id,
        UUID researchGroupId,
        UUID laboratoryId,
        String laboratoryName,
        InventoryEntrySource source,
        String sourceName,
        LocalDate receivedAt,
        String notes,
        InventoryEntryStatus status,
        LocalDateTime reversedAt,
        String reversalReason,
        LocalDateTime createdAt,
        List<InventoryEntryHistoryItem> items
) {
    public InventoryEntryHistoryRecord {
        items = List.copyOf(items);
    }
}
