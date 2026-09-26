package com.mylab.backend.inventory.application.usecase;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import com.mylab.backend.inventory.application.dto.*;
import com.mylab.backend.inventory.application.port.in.GetInventoryMovementHistoryPort;
import com.mylab.backend.inventory.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.inventory.application.port.out.InventoryMovementQueryPort;
import com.mylab.backend.inventory.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;

@Service
@RequiredArgsConstructor
public class GetInventoryMovementHistoryUsecase implements GetInventoryMovementHistoryPort {
    private final InventoryMovementQueryPort query;
    private final ResearchGroupLookupPort groups;

    @Override
    public List<InventoryMovementHistoryRecord> getHistory(UUID groupId, InventoryMovementSearchCriteria criteria) {
        if (!groups.existsById(groupId)) throw new ResearchGroupNotFoundException(groupId);
        if (criteria.dateFrom() != null && criteria.dateTo() != null
                && criteria.dateFrom().isAfter(criteria.dateTo())) {
            throw new InvalidInventoryException("dateFrom must not be after dateTo");
        }
        return query.findHistory(groupId, criteria);
    }
}
