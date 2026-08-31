package com.mylab.backend.person.infrastructure.adapters.out.persistence;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.person.application.port.out.ResearchLineLookupPort;
import com.mylab.backend.researchline.infrastructure.adapters.out.persistence.repository.ResearchLineJpaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ResearchLineLookupAdapter implements ResearchLineLookupPort {

    private final ResearchLineJpaRepository researchLineJpaRepository;

    @Override
    public boolean existsByIdAndResearchGroupId(UUID researchLineId, UUID researchGroupId) {
        log.debug("Checking if research line {} belongs to research group {}", researchLineId, researchGroupId);
        return researchLineJpaRepository.existsByIdAndResearchGroupId(researchLineId, researchGroupId);
    }
}
