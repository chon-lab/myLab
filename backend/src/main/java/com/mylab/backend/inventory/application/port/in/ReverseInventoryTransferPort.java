package com.mylab.backend.inventory.application.port.in;

import java.util.UUID;

import com.mylab.backend.inventory.application.dto.ReverseInventoryTransferInput;

public interface ReverseInventoryTransferPort {
    void reverse(UUID transferId, ReverseInventoryTransferInput input);
}

