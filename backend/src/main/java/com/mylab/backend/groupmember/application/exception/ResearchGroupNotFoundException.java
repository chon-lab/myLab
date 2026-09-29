package com.mylab.backend.groupmember.application.exception;

import java.util.UUID;

public class ResearchGroupNotFoundException extends RuntimeException {

    public ResearchGroupNotFoundException(UUID researchGroupId) {
        super("Research group " + researchGroupId + " was not found");
    }
}
