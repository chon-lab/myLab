package com.mylab.backend.groupmember.application.port.out;

import java.util.Optional;
import java.util.UUID;

public interface ResearchGroupLookupPort {
    boolean existsById(UUID researchGroupId);
    Optional<String> findName(UUID researchGroupId);
}
