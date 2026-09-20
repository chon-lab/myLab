package com.mylab.backend.inventory.domain.model;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;

public record InventoryTransferItem(
        UUID id,
        UUID inventoryItemId,
        BigDecimal quantity,
        BigDecimal unitCost
) {
    public InventoryTransferItem {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(inventoryItemId, "inventoryItemId must not be null");
        Objects.requireNonNull(quantity, "quantity must not be null");
        Objects.requireNonNull(unitCost, "unitCost must not be null");

        if (quantity.signum() <= 0) {
            throw new InvalidInventoryException("quantity must be greater than zero");
        }
        if (quantity.stripTrailingZeros().scale() > 4) {
            throw new InvalidInventoryException("quantity supports up to 4 decimal places");
        }
        if (unitCost.signum() <= 0) {
            throw new InvalidInventoryException("unitCost must be greater than zero");
        }
        if (unitCost.stripTrailingZeros().scale() > 2) {
            throw new InvalidInventoryException("unitCost supports up to 2 decimal places");
        }
    }
}

