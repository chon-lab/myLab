package com.mylab.backend.inventory.application.port.in;

import java.util.UUID;

import com.mylab.backend.inventory.application.dto.InventoryExitHistoryRecord;

public interface GetInventoryExitPort {
    InventoryExitHistoryRecord get(UUID id);
}

