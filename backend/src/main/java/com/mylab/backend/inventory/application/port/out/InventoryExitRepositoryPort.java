package com.mylab.backend.inventory.application.port.out;

import java.util.Optional;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryExit;

public interface InventoryExitRepositoryPort {
    void save(InventoryExit exit);
    Optional<InventoryExit> findById(UUID id);
}

