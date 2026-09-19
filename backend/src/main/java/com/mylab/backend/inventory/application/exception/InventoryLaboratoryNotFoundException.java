package com.mylab.backend.inventory.application.exception;

import java.util.UUID;

public class InventoryLaboratoryNotFoundException extends RuntimeException {
    public InventoryLaboratoryNotFoundException(UUID laboratoryId) {
        super("Laboratory not found: " + laboratoryId);
    }
}
