package com.mylab.backend.inventory.application.port.in;

import java.util.UUID;

import com.mylab.backend.inventory.application.dto.InventoryTransferHistoryRecord;

public interface GetInventoryTransferPort {
    InventoryTransferHistoryRecord get(UUID id);
}

