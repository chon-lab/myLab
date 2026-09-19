package com.mylab.backend.inventory.application.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryEntrySource;

public record CreateInventoryEntryInput(
        UUID laboratoryId,
        InventoryEntrySource source,
        String sourceName,
        LocalDate receivedAt,
        String notes,
        List<CreateInventoryEntryItemInput> items
) {
}
