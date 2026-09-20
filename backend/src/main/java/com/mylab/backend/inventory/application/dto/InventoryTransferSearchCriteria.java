package com.mylab.backend.inventory.application.dto;

import java.time.LocalDate;
import java.util.UUID;

public record InventoryTransferSearchCriteria(
        UUID sourceLaboratoryId,
        UUID destinationLaboratoryId,
        UUID inventoryItemId,
        LocalDate dateFrom,
        LocalDate dateTo
) {}

