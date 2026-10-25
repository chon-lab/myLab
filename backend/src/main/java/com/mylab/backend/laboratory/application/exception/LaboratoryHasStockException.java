package com.mylab.backend.laboratory.application.exception;

import java.util.UUID;

public class LaboratoryHasStockException extends RuntimeException {
    public LaboratoryHasStockException(UUID laboratoryId) {
        super("Laboratory " + laboratoryId + " still has inventory stock");
    }
}
