package com.mylab.backend.inventory.application.usecase;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.InventoryExitHistoryRecord;
import com.mylab.backend.inventory.application.dto.InventoryExitSearchCriteria;
import com.mylab.backend.inventory.application.exception.InventoryLaboratoryNotFoundException;
import com.mylab.backend.inventory.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.inventory.application.port.in.GetInventoryExitHistoryPort;
import com.mylab.backend.inventory.application.port.out.InventoryExitQueryPort;
import com.mylab.backend.inventory.application.port.out.InventoryLaboratoryLookupPort;
import com.mylab.backend.inventory.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;

@Service
@RequiredArgsConstructor
public class GetInventoryExitHistoryUsecase implements GetInventoryExitHistoryPort {
    private final InventoryExitQueryPort exitQuery;
    private final ResearchGroupLookupPort researchGroupLookup;
    private final InventoryLaboratoryLookupPort laboratoryLookup;

    @Override
    @Transactional(readOnly = true)
    public List<InventoryExitHistoryRecord> getHistory(
            UUID researchGroupId,
            InventoryExitSearchCriteria criteria
    ) {
        if (!researchGroupLookup.existsById(researchGroupId)) {
            throw new ResearchGroupNotFoundException(researchGroupId);
        }
        if (criteria == null) {
            throw new InvalidInventoryException("search criteria must not be null");
        }
        if (criteria.dateFrom() != null && criteria.dateTo() != null
                && criteria.dateFrom().isAfter(criteria.dateTo())) {
            throw new InvalidInventoryException("dateFrom must not be after dateTo");
        }
        validateLaboratoryScope(researchGroupId, criteria.laboratoryId());
        return exitQuery.findHistory(researchGroupId, criteria);
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

