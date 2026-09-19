package com.mylab.backend.inventory.application.port.out;

import java.util.Optional;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryEntry;

public interface InventoryEntryRepositoryPort {
    void save(InventoryEntry entry);

    Optional<InventoryEntry> findById(UUID id);
}

