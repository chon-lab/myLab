package com.mylab.backend.inventory.application.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateInventoryEntryItemInput(
        UUID inventoryItemId,
        BigDecimal quantity,
        BigDecimal historicalUnitValue,
        String batchNumber,
        String manufacturer,
        LocalDate expirationDate
) {
}
