package com.mylab.backend.inventory.application.port.in;

import java.util.UUID;

import com.mylab.backend.inventory.application.dto.ReverseInventoryExitInput;

public interface ReverseInventoryExitPort {
    void reverse(UUID exitId, ReverseInventoryExitInput input);
}

