package com.mylab.backend.inventory.application.port.out;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.inventory.application.dto.InventoryMovementHistoryRecord;
import com.mylab.backend.inventory.application.dto.InventoryMovementSearchCriteria;

public interface InventoryMovementQueryPort {
    List<InventoryMovementHistoryRecord> findHistory(UUID researchGroupId, InventoryMovementSearchCriteria criteria);
}
