package com.mylab.backend.inventory.application.port.in;

import java.util.UUID;
import com.mylab.backend.inventory.application.dto.CreateInventoryItemInput;

public interface CreateInventoryItemPort {
    UUID create(UUID researchGroupId, CreateInventoryItemInput input);
}
