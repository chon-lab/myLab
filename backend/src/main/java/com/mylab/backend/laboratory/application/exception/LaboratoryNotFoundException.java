package com.mylab.backend.laboratory.application.exception;

import java.util.UUID;

public class LaboratoryNotFoundException extends RuntimeException {

    public LaboratoryNotFoundException(UUID laboratoryId) {
        super("Laboratory " + laboratoryId + " was not found");
    }
}
