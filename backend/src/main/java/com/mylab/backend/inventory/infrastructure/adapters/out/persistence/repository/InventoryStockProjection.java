package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository;

import java.math.BigDecimal;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryItemType;
import com.mylab.backend.inventory.domain.model.InventoryUnitOfMeasure;

public interface InventoryStockProjection {
    UUID getInventoryItemId();
    String getItemName();
    InventoryItemType getItemType();
    InventoryUnitOfMeasure getUnitOfMeasure();
    BigDecimal getQuantity();
    BigDecimal getTotalValue();
}
