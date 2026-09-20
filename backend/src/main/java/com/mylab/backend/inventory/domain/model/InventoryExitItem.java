package com.mylab.backend.inventory.domain.model;

import java.math.BigDecimal;
import java.util.UUID;

import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;

public record InventoryExitItem(
        UUID id,
        UUID inventoryItemId,
        BigDecimal quantity,
        BigDecimal unitCost
) {
    public InventoryExitItem {
        if (id == null || inventoryItemId == null) {
            throw new InvalidInventoryException("Exit item and inventory item IDs are required");
        }
        if (quantity == null || quantity.signum() <= 0) {
            throw new InvalidInventoryException("quantity must be greater than zero");
        }
        if (quantity.stripTrailingZeros().scale() > 4) {
            throw new InvalidInventoryException("quantity supports up to 4 decimal places");
        }
        if (unitCost == null || unitCost.signum() <= 0) {
            throw new InvalidInventoryException("unitCost must be greater than zero");
        }
        if (unitCost.stripTrailingZeros().scale() > 2) {
            throw new InvalidInventoryException("unitCost supports up to 2 decimal places");
        }
    }
}

