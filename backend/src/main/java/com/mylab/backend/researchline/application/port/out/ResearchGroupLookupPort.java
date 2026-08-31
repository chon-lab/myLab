package com.mylab.backend.researchline.application.port.out;

import java.util.UUID;

public interface ResearchGroupLookupPort {
    boolean existsById(UUID researchGroupId);
}
