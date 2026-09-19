package com.mylab.backend.inventory.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryItemType;
import com.mylab.backend.inventory.domain.model.InventoryUnitOfMeasure;

public record InventoryStockItem(
        UUID inventoryItemId,
        String itemName,
        InventoryItemType itemType,
        InventoryUnitOfMeasure unitOfMeasure,
        BigDecimal quantity,
        BigDecimal totalValue
) {
}
