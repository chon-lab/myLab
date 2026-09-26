package com.mylab.backend.inventory.application.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record InventoryMovementHistoryItem(UUID id, UUID inventoryItemId, String itemName,
        BigDecimal quantity, BigDecimal unitCost, BigDecimal totalValue,
        String batchNumber, String manufacturer, LocalDate expirationDate) {}
