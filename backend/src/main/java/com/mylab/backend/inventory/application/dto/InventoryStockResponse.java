package com.mylab.backend.inventory.application.dto;

import java.math.BigDecimal;
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
    }
}
