package com.mylab.backend.inventory.application.usecase;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.InventoryStockItem;
import com.mylab.backend.inventory.application.dto.InventoryStockResponse;
import com.mylab.backend.inventory.application.exception.InventoryLaboratoryNotFoundException;
import com.mylab.backend.inventory.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.inventory.application.port.in.GetInventoryStockPort;
import com.mylab.backend.inventory.application.port.out.InventoryLaboratoryLookupPort;
import com.mylab.backend.inventory.application.port.out.InventoryStockQueryPort;
import com.mylab.backend.inventory.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;

@Service
@RequiredArgsConstructor
public class GetInventoryStockUsecase implements GetInventoryStockPort {
    private final InventoryStockQueryPort stockQuery;
    private final ResearchGroupLookupPort researchGroupLookup;
    private final InventoryLaboratoryLookupPort laboratoryLookup;

    @Override
    @Transactional(readOnly = true)
    public InventoryStockResponse getStock(UUID researchGroupId, UUID laboratoryId) {
        if (!researchGroupLookup.existsById(researchGroupId)) {
            throw new ResearchGroupNotFoundException(researchGroupId);
        }
        validateLaboratoryScope(researchGroupId, laboratoryId);
        List<InventoryStockItem> items = stockQuery.findStock(researchGroupId, laboratoryId);
        BigDecimal totalValue = items.stream()
                .map(InventoryStockItem::totalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new InventoryStockResponse(researchGroupId, laboratoryId, items, totalValue);
    }

    private void validateLaboratoryScope(UUID researchGroupId, UUID laboratoryId) {
        if (laboratoryId == null) {
            return;
        }

        UUID laboratoryGroupId = laboratoryLookup.findResearchGroupIdByLaboratoryId(laboratoryId)
                .orElseThrow(() -> new InventoryLaboratoryNotFoundException(laboratoryId));
        if (!researchGroupId.equals(laboratoryGroupId)) {
            throw new InvalidInventoryException("laboratory must belong to the specified research group");
        }
    }
}
