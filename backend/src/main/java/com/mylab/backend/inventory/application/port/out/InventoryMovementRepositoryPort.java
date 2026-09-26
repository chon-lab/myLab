package com.mylab.backend.inventory.application.port.out;

import java.util.Optional;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryMovement;

public interface InventoryMovementRepositoryPort {
    void save(InventoryMovement movement);
    Optional<InventoryMovement> findById(UUID id);
    Optional<InventoryMovement> findByIdForUpdate(UUID id);
}
