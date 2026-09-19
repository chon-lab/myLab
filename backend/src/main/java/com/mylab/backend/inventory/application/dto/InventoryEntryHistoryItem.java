package com.mylab.backend.inventory.application.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryItemType;
import com.mylab.backend.inventory.domain.model.InventoryUnitOfMeasure;

public record InventoryEntryHistoryItem(
        UUID id,
        UUID inventoryItemId,
        String itemName,
        InventoryItemType itemType,
        InventoryUnitOfMeasure unitOfMeasure,
        BigDecimal quantity,
        BigDecimal historicalUnitValue,
        String batchNumber,
        String manufacturer,
        LocalDate expirationDate
) {
    public InventoryEntryHistoryItem {
        BigDecimal normalizedQuantity = quantity.stripTrailingZeros();
        quantity = normalizedQuantity.scale() < 0
                ? normalizedQuantity.setScale(0)
                : normalizedQuantity;
    }
}
