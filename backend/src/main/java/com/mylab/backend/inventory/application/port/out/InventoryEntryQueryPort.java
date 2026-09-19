package com.mylab.backend.inventory.application.port.out;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.inventory.application.dto.InventoryEntryHistoryRecord;
import com.mylab.backend.inventory.application.dto.InventoryEntrySearchCriteria;

public interface InventoryEntryQueryPort {
    List<InventoryEntryHistoryRecord> findHistory(
            UUID researchGroupId,
            InventoryEntrySearchCriteria criteria
    );
}
