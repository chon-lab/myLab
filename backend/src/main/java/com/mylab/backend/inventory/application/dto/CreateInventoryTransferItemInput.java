package com.mylab.backend.inventory.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateInventoryTransferItemInput(
        UUID inventoryItemId,
        BigDecimal quantity
) {}

