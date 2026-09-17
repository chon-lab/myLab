package com.mylab.backend.inventory.application.exception;

import java.util.UUID;

public class ResearchGroupNotFoundException extends RuntimeException {

    public ResearchGroupNotFoundException(UUID id) {
        super("Research group not found: " + id);
    }
}
