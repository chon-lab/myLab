package com.mylab.backend.inventory.application.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryEntrySource;

public record InventoryEntrySearchCriteria(
        UUID laboratoryId,
        InventoryEntrySource source,
        UUID inventoryItemId,
        LocalDate dateFrom,
        LocalDate dateTo
) {
}
