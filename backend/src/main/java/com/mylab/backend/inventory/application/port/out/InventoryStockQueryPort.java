package com.mylab.backend.inventory.application.port.out;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.inventory.application.dto.InventoryStockItem;

public interface InventoryStockQueryPort {
    List<InventoryStockItem> findStock(UUID researchGroupId, UUID laboratoryId);
}
