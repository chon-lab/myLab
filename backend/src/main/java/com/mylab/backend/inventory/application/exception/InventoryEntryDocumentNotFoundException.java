package com.mylab.backend.inventory.application.exception;

import java.util.UUID;

public class InventoryEntryDocumentNotFoundException extends RuntimeException {
    public InventoryEntryDocumentNotFoundException(UUID documentId) {
        super("Inventory entry document " + documentId + " was not found");
    }
}
