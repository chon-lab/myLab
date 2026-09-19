package com.mylab.backend.inventory.application.port.in;

import java.util.UUID;

import com.mylab.backend.inventory.application.dto.InventoryStockResponse;

public interface GetInventoryStockPort {
    InventoryStockResponse getStock(UUID researchGroupId, UUID laboratoryId);
}
