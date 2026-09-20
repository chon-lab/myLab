package com.mylab.backend.inventory.application.port.in;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.inventory.application.dto.InventoryExitHistoryRecord;
import com.mylab.backend.inventory.application.dto.InventoryExitSearchCriteria;

public interface GetInventoryExitHistoryPort {
    List<InventoryExitHistoryRecord> getHistory(UUID researchGroupId, InventoryExitSearchCriteria criteria);
}

