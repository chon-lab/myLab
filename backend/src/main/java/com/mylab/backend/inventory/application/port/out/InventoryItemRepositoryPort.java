package com.mylab.backend.inventory.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.mylab.backend.inventory.domain.model.InventoryItem;
public interface InventoryItemRepositoryPort {
    void save(InventoryItem item);
    Optional<InventoryItem> findById(UUID id);
    List<InventoryItem> findAllByResearchGroupId(UUID researchGroupId);
    void deleteById(UUID id);
}
