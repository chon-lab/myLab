package com.mylab.backend.inventory.application.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

public record InventoryStockResponse(
        UUID researchGroupId,
        UUID laboratoryId,
        List<InventoryStockItem> items,
        BigDecimal totalValue
) {
    public InventoryStockResponse {
        items = List.copyOf(items);
        totalValue = totalValue.setScale(2, RoundingMode.HALF_UP);
    }
}
