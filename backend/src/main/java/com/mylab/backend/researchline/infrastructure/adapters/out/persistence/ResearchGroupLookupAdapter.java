package com.mylab.backend.researchline.infrastructure.adapters.out.persistence;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence.repository.ResearchGroupJpaRepository;
import com.mylab.backend.researchline.application.port.out.ResearchGroupLookupPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ResearchGroupLookupAdapter implements ResearchGroupLookupPort {

    private final ResearchGroupJpaRepository researchGroupJpaRepository;

    @Override
    public boolean existsById(UUID researchGroupId) {
        log.debug("Checking if research group exists by ID: {}", researchGroupId);
        return researchGroupJpaRepository.existsById(researchGroupId);
    }
}
