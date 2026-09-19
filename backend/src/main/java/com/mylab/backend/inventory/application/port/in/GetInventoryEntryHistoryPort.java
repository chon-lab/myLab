package com.mylab.backend.inventory.application.port.in;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.inventory.application.dto.InventoryEntryHistoryRecord;
import com.mylab.backend.inventory.application.dto.InventoryEntrySearchCriteria;

public interface GetInventoryEntryHistoryPort {
    List<InventoryEntryHistoryRecord> getHistory(
            UUID researchGroupId,
            InventoryEntrySearchCriteria criteria
    );
}
