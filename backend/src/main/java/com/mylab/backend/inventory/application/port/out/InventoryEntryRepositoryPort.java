package com.mylab.backend.inventory.application.port.out;

import com.mylab.backend.inventory.domain.model.InventoryEntry;

public interface InventoryEntryRepositoryPort {
    void save(InventoryEntry entry);
}
