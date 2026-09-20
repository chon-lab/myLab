package com.mylab.backend.inventory.application.port.in;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.inventory.application.dto.InventoryTransferHistoryRecord;
import com.mylab.backend.inventory.application.dto.InventoryTransferSearchCriteria;

public interface GetInventoryTransferHistoryPort {
    List<InventoryTransferHistoryRecord> getHistory(UUID researchGroupId, InventoryTransferSearchCriteria criteria);
}

