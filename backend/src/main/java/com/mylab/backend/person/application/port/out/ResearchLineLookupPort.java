package com.mylab.backend.person.application.port.out;

import java.util.UUID;

public interface ResearchLineLookupPort {
    boolean existsByIdAndResearchGroupId(UUID researchLineId, UUID researchGroupId);
}
