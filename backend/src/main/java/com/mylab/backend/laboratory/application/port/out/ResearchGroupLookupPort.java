package com.mylab.backend.laboratory.application.port.out;

import java.util.UUID;

public interface ResearchGroupLookupPort {
    boolean existsById(UUID researchGroupId);
}
