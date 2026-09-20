package com.mylab.backend.inventory.application.port.in;

import java.util.UUID;

import com.mylab.backend.inventory.application.dto.CreateInventoryTransferInput;

public interface CreateInventoryTransferPort {
    UUID create(UUID researchGroupId, CreateInventoryTransferInput input);
}

