package com.mylab.backend.inventory.application.exception;

import java.util.UUID;

public class InventoryItemNotFoundException extends RuntimeException {

    public InventoryItemNotFoundException(UUID id) {
        super("Inventory item not found: " + id);
    }
}
