package com.mylab.backend.inventory.application.usecase;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.inventory.application.port.in.GetAllInventoryItemsPort;
import com.mylab.backend.inventory.application.port.out.InventoryItemRepositoryPort;
import com.mylab.backend.inventory.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.inventory.domain.model.InventoryItem;

@Service
@RequiredArgsConstructor
public class GetAllInventoryItemsUsecase implements GetAllInventoryItemsPort {
    private final InventoryItemRepositoryPort repository;
    private final ResearchGroupLookupPort groups;

    @Transactional(readOnly = true)
    public List<InventoryItem> getAllByResearchGroup(UUID groupId) {
        Objects.requireNonNull(groupId, "researchGroupId must not be null");
        if (!groups.existsById(groupId)) {
            throw new ResearchGroupNotFoundException(groupId);
        }
        return repository.findAllByResearchGroupId(groupId);
    }
}
