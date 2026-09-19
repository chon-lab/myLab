package com.mylab.backend.inventory.application.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
    public InventoryStockItem {
        quantity = normalizeQuantity(quantity);
        totalValue = totalValue.setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal normalizeQuantity(BigDecimal value) {
        BigDecimal normalized = value.stripTrailingZeros();
        return normalized.scale() < 0 ? normalized.setScale(0) : normalized;
    }
}
