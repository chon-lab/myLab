package com.mylab.backend.inventory.application.exception;

import java.util.UUID;

public class InventoryTransferNotFoundException extends RuntimeException {
    public InventoryTransferNotFoundException(UUID id) {
        super("Inventory transfer not found: " + id);
    }
}

