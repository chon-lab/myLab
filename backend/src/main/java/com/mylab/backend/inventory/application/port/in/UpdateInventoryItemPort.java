package com.mylab.backend.inventory.application.port.in;

import java.util.UUID;
import com.mylab.backend.inventory.application.dto.UpdateInventoryItemInput;

public interface UpdateInventoryItemPort {
    void update(UUID id, UpdateInventoryItemInput input);
}
