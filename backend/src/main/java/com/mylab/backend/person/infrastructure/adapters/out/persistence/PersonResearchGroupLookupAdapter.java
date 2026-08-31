package com.mylab.backend.person.infrastructure.adapters.out.persistence;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.person.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence.repository.ResearchGroupJpaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Named {@code PersonResearchGroupLookupAdapter} rather than {@code ResearchGroupLookupAdapter}
 * to avoid a Spring bean name collision with research-line's own adapter of the same shape
 * (both are {@code @Component}, auto-named from the simple class name).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PersonResearchGroupLookupAdapter implements ResearchGroupLookupPort {

    private final ResearchGroupJpaRepository researchGroupJpaRepository;

    @Override
    public boolean existsById(UUID researchGroupId) {
        log.debug("Checking if research group exists by ID: {}", researchGroupId);
        return researchGroupJpaRepository.existsById(researchGroupId);
    }
}
