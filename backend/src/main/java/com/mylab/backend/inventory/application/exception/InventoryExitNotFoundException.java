package com.mylab.backend.inventory.application.exception;

import java.util.UUID;

public class InventoryExitNotFoundException extends RuntimeException {
    public InventoryExitNotFoundException(UUID id) {
        super("Inventory exit not found: " + id);
    }
}

