package com.mylab.backend.inventory.application.port.in;

import java.util.UUID;

public interface DeleteInventoryItemPort {
    void delete(UUID id);
}
