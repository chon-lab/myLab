package com.mylab.backend.inventory.application.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateInventoryTransferInput(
        UUID sourceLaboratoryId,
        UUID destinationLaboratoryId,
        LocalDate transferredAt,
        String notes,
        List<CreateInventoryTransferItemInput> items
) {
    public CreateInventoryTransferInput {
        items = items == null ? List.of() : List.copyOf(items);
    }
}

