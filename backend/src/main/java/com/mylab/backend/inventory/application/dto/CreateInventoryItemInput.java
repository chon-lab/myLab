package com.mylab.backend.inventory.application.dto;

import java.math.BigDecimal;
import com.mylab.backend.inventory.domain.model.InventoryItemType;
import com.mylab.backend.inventory.domain.model.InventoryUnitOfMeasure;

public record CreateInventoryItemInput(
        String name,
        String description,
        InventoryItemType itemType,
        InventoryUnitOfMeasure unitOfMeasure,
        BigDecimal referenceUnitValue
) {
}
