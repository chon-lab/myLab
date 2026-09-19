package com.mylab.backend.inventory.domain.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;

public record InventoryEntry(
        UUID id,
        UUID researchGroupId,
        UUID laboratoryId,
        InventoryEntrySource source,
        String sourceName,
        LocalDate receivedAt,
        String notes,
        InventoryEntryStatus status,
        LocalDateTime reversedAt,
        String reversalReason,
        LocalDateTime createdAt,
        List<InventoryEntryItem> items
) {
    public InventoryEntry {
        if (id == null || researchGroupId == null || laboratoryId == null || source == null
                || status == null || createdAt == null || receivedAt == null) {
            throw new InvalidInventoryException("Required inventory entry fields must not be null");
        }
        if (sourceName == null || sourceName.isBlank()) {
            throw new InvalidInventoryException("sourceName must not be blank");
        }
        sourceName = sourceName.trim();
        if (sourceName.length() > 255) {
            throw new InvalidInventoryException("sourceName must not exceed 255 characters");
        }
        if (notes != null && notes.length() > 3000) {
            throw new InvalidInventoryException("notes must not exceed 3000 characters");
        }
        if (status == InventoryEntryStatus.CONFIRMED && (reversedAt != null || reversalReason != null)) {
            throw new InvalidInventoryException("a confirmed entry cannot contain reversal data");
        }
        if (status == InventoryEntryStatus.REVERSED
                && (reversedAt == null || reversalReason == null || reversalReason.isBlank())) {
            throw new InvalidInventoryException("a reversed entry requires reversal date and reason");
        }
        if (reversalReason != null) {
            reversalReason = reversalReason.trim();
            if (reversalReason.length() > 2000) {
                throw new InvalidInventoryException("reversalReason must not exceed 2000 characters");
            }
        }
        items = items == null ? List.of() : List.copyOf(items);
        if (items.isEmpty()) {
            throw new InvalidInventoryException("At least one entry item is required");
        }
    }
}
