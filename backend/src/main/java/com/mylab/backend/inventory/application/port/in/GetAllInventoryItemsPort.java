package com.mylab.backend.inventory.application.port.in;

import java.util.List;
import java.util.UUID;
import com.mylab.backend.inventory.domain.model.InventoryItem;

public interface GetAllInventoryItemsPort {
    List<InventoryItem> getAllByResearchGroup(UUID researchGroupId);
}
