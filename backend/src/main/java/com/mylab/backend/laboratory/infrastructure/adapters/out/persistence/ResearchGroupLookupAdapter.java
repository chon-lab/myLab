package com.mylab.backend.laboratory.infrastructure.adapters.out.persistence;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.laboratory.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence.repository.ResearchGroupJpaRepository;

import lombok.RequiredArgsConstructor;

@Component("laboratoryResearchGroupLookupAdapter")
@RequiredArgsConstructor
public class ResearchGroupLookupAdapter implements ResearchGroupLookupPort {

    private final ResearchGroupJpaRepository researchGroupJpaRepository;

    @Override
    public boolean existsById(UUID researchGroupId) {
        return researchGroupJpaRepository.existsById(researchGroupId);
    }
}
