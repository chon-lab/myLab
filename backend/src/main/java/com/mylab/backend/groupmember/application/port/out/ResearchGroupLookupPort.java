package com.mylab.backend.groupmember.application.port.out;

import java.util.UUID;

public interface ResearchGroupLookupPort {
    boolean existsById(UUID researchGroupId);
}
