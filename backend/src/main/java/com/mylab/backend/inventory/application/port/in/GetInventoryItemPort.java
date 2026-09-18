package com.mylab.backend.inventory.application.port.in;

import java.util.UUID;
import com.mylab.backend.inventory.domain.model.InventoryItem;

public interface GetInventoryItemPort {
    InventoryItem get(UUID id);
}
