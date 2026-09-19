package com.mylab.backend.inventory.application.exception;

import java.util.UUID;

public class InventoryEntryNotFoundException extends RuntimeException {

    public InventoryEntryNotFoundException(UUID id) {
        super("Inventory entry not found: " + id);
    }
}
