package com.mylab.backend.person.application.exception;

import java.util.UUID;

public class ResearchLineNotFoundException extends RuntimeException {

    public ResearchLineNotFoundException(UUID researchLineId) {
        super("Research line " + researchLineId + " was not found in this research group");
    }
}
