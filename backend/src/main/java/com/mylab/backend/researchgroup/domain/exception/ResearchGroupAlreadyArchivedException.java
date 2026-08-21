package com.mylab.backend.researchgroup.domain.exception;

import java.util.UUID;

public class ResearchGroupAlreadyArchivedException extends IllegalStateException {

    public ResearchGroupAlreadyArchivedException(UUID researchGroupId) {
        super("Research group " + researchGroupId + " is already archived");
    }
}
