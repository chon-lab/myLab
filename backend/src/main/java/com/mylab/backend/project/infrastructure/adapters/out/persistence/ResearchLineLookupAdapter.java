package com.mylab.backend.project.infrastructure.adapters.out.persistence;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.project.application.port.out.ResearchLineLookupPort;
import com.mylab.backend.researchline.infrastructure.adapters.out.persistence.repository.ResearchLineJpaRepository;

import lombok.RequiredArgsConstructor;

@Component("projectResearchLineLookupAdapter")
@RequiredArgsConstructor
public class ResearchLineLookupAdapter implements ResearchLineLookupPort {

    private final ResearchLineJpaRepository researchLineJpaRepository;

    @Override
    public boolean existsByIdAndResearchGroupId(UUID researchLineId, UUID researchGroupId) {
        return researchLineJpaRepository.existsByIdAndResearchGroupId(researchLineId, researchGroupId);
    }
}
