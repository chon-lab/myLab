package com.mylab.backend.inventory.infrastructure.adapters.out.persistence;

import java.util.UUID;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

import com.mylab.backend.inventory.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence.repository.ResearchGroupJpaRepository;

@Component("inventoryResearchGroupLookupAdapter")
@RequiredArgsConstructor
class ResearchGroupLookupAdapter implements ResearchGroupLookupPort {

    private final ResearchGroupJpaRepository repository;

    @Override
    public boolean existsById(UUID id) {
        return repository.existsById(id);
    }
}
