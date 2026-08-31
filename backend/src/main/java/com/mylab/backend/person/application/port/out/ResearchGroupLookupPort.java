package com.mylab.backend.person.application.port.out;

import java.util.UUID;

public interface ResearchGroupLookupPort {
    boolean existsById(UUID researchGroupId);
}
