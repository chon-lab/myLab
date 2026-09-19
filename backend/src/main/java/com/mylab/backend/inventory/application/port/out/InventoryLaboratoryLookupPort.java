package com.mylab.backend.inventory.application.port.out;

import java.util.Optional;
import java.util.UUID;

public interface InventoryLaboratoryLookupPort {
    Optional<UUID> findResearchGroupIdByLaboratoryId(UUID laboratoryId);
}
