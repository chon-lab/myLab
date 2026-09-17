package com.mylab.backend.project.application.port.out;

import java.util.Optional;
import java.util.UUID;

public interface LaboratoryLookupPort {
    Optional<UUID> findResearchGroupIdById(UUID laboratoryId);
}
