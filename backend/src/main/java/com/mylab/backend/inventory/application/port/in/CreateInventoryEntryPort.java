package com.mylab.backend.inventory.application.port.in;

import java.util.UUID;

import com.mylab.backend.inventory.application.dto.CreateInventoryEntryInput;

public interface CreateInventoryEntryPort {
    UUID create(UUID researchGroupId, CreateInventoryEntryInput input);
}
