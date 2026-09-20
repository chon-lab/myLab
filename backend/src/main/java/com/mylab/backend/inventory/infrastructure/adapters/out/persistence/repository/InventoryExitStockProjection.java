package com.mylab.backend.inventory.infrastructure.adapters.out.persistence.repository;

import java.math.BigDecimal;
import java.util.UUID;

public interface InventoryExitStockProjection {
    UUID getInventoryItemId();
    BigDecimal getQuantity();
    BigDecimal getTotalValue();
}

