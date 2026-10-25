package com.mylab.backend.laboratory.infrastructure.adapters.out.persistence;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.inventory.application.port.out.InventoryStockQueryPort;
import com.mylab.backend.laboratory.application.port.out.LaboratoryStockLookupPort;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class LaboratoryStockLookupAdapter implements LaboratoryStockLookupPort {
    private final InventoryStockQueryPort stockQueryPort;

    @Override
    public boolean hasStock(UUID researchGroupId, UUID laboratoryId) {
        return !stockQueryPort.findStock(researchGroupId, laboratoryId).isEmpty();
    }
}
