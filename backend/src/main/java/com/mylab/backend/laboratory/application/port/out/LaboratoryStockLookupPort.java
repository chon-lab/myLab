package com.mylab.backend.laboratory.application.port.out;

import java.util.UUID;

public interface LaboratoryStockLookupPort {
    boolean hasStock(UUID researchGroupId, UUID laboratoryId);
}
