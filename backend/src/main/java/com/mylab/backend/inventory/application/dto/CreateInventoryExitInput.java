package com.mylab.backend.inventory.application.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryExitType;

public record CreateInventoryExitInput(
        UUID laboratoryId,
        InventoryExitType type,
        LocalDate occurredAt,
        String notes,
        List<CreateInventoryExitItemInput> items
) {
    public CreateInventoryExitInput {
        items = items == null ? List.of() : List.copyOf(items);
    }
}

