package com.mylab.backend.inventory.application.port.out;

import java.util.Optional;
import java.util.UUID;

import com.mylab.backend.inventory.domain.model.InventoryTransfer;

public interface InventoryTransferRepositoryPort {
    void save(InventoryTransfer transfer);
    Optional<InventoryTransfer> findById(UUID id);
}

