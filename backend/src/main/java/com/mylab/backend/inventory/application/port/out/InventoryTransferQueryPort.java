package com.mylab.backend.inventory.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.mylab.backend.inventory.application.dto.InventoryTransferHistoryRecord;
import com.mylab.backend.inventory.application.dto.InventoryTransferSearchCriteria;

public interface InventoryTransferQueryPort {
    List<InventoryTransferHistoryRecord> findHistory(UUID researchGroupId, InventoryTransferSearchCriteria criteria);
    Optional<InventoryTransferHistoryRecord> findById(UUID id);
}

