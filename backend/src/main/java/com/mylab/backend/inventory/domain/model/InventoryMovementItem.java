package com.mylab.backend.inventory.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;

public record InventoryMovementItem(UUID id, UUID inventoryItemId, BigDecimal quantity,
                                    BigDecimal unitCost, String batchNumber, String manufacturer,
                                    LocalDate expirationDate) {
    public InventoryMovementItem {
        if (id == null || inventoryItemId == null || quantity == null || unitCost == null) {
            throw new InvalidInventoryException("Movement item fields are required");
        }
        if (quantity.signum() <= 0 || quantity.stripTrailingZeros().scale() > 4) {
            throw new InvalidInventoryException("quantity must be positive with at most 4 decimal places");
        }
        if (unitCost.signum() <= 0 || unitCost.stripTrailingZeros().scale() > 2) {
            throw new InvalidInventoryException("unitCost must be positive with at most 2 decimal places");
        }
        batchNumber = trimAndLimit(batchNumber, 100, "batchNumber");
        manufacturer = trimAndLimit(manufacturer, 255, "manufacturer");
    }

    private static String trimAndLimit(String value, int maximum, String field) {
        if (value == null || value.isBlank()) return null;
        String trimmed = value.trim();
        if (trimmed.length() > maximum) {
            throw new InvalidInventoryException(field + " must not exceed " + maximum + " characters");
        }
        return trimmed;
    }
}
