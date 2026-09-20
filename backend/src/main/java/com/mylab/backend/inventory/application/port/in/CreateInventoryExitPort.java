package com.mylab.backend.inventory.application.port.in;

import java.util.UUID;

import com.mylab.backend.inventory.application.dto.CreateInventoryExitInput;

public interface CreateInventoryExitPort {
    UUID create(UUID researchGroupId, CreateInventoryExitInput input);
}

