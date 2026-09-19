package com.mylab.backend.inventory.application.port.in;

import java.util.UUID;

import com.mylab.backend.inventory.application.dto.InventoryEntryHistoryRecord;

public interface GetInventoryEntryPort {
    InventoryEntryHistoryRecord get(UUID id);
}
