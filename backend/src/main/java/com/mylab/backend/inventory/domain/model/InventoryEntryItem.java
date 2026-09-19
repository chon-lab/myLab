package com.mylab.backend.inventory.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;

public record InventoryEntryItem(
        UUID id,
        UUID inventoryItemId,
        BigDecimal quantity,
        BigDecimal historicalUnitValue,
        String batchNumber,
        String manufacturer,
        LocalDate expirationDate
) {
    public InventoryEntryItem {
        if (id == null || inventoryItemId == null) {
            throw new InvalidInventoryException("Entry item and inventory item IDs are required");
        }
        if (quantity == null || quantity.signum() <= 0) {
            throw new InvalidInventoryException("quantity must be greater than zero");
        }
        if (quantity.stripTrailingZeros().scale() > 4) {
            throw new InvalidInventoryException("quantity supports up to 4 decimal places");
        }
        if (historicalUnitValue == null || historicalUnitValue.signum() <= 0) {
            throw new InvalidInventoryException("historicalUnitValue must be greater than zero");
        }
        if (historicalUnitValue.stripTrailingZeros().scale() > 2) {
            throw new InvalidInventoryException("historicalUnitValue supports up to 2 decimal places");
        }
        batchNumber = trimAndLimit(batchNumber, 100, "batchNumber");
        manufacturer = trimAndLimit(manufacturer, 255, "manufacturer");
    }

    private static String trimAndLimit(String value, int maxLength, String field) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new InvalidInventoryException(field + " must not exceed " + maxLength + " characters");
        }
        return normalized;
    }
}
