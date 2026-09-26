package com.mylab.backend.inventory.application.port.in;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.inventory.application.dto.InventoryMovementHistoryRecord;
import com.mylab.backend.inventory.application.dto.InventoryMovementSearchCriteria;

public interface GetInventoryMovementHistoryPort {
    List<InventoryMovementHistoryRecord> getHistory(UUID groupId, InventoryMovementSearchCriteria criteria);
}
