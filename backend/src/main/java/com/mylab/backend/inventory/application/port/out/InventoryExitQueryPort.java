package com.mylab.backend.inventory.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.mylab.backend.inventory.application.dto.InventoryExitHistoryRecord;
import com.mylab.backend.inventory.application.dto.InventoryExitSearchCriteria;

public interface InventoryExitQueryPort {
    List<InventoryExitHistoryRecord> findHistory(UUID researchGroupId, InventoryExitSearchCriteria criteria);
    Optional<InventoryExitHistoryRecord> findById(UUID id);
}

