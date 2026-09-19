package com.mylab.backend.inventory.application.port.in;

import java.util.UUID;

import com.mylab.backend.inventory.application.dto.ReverseInventoryEntryInput;

public interface ReverseInventoryEntryPort {
    void reverse(UUID entryId, ReverseInventoryEntryInput input);
}

