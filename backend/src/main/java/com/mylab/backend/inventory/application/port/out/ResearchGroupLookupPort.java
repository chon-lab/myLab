package com.mylab.backend.inventory.application.port.out;

import java.util.UUID;

public interface ResearchGroupLookupPort {
    boolean existsById(UUID id);
}
