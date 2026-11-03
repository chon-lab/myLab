package com.mylab.backend.groupmember.infrastructure.adapters.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.mylab.backend.groupmember.application.port.out.ResearchGroupLookupPort;
import com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence.entity.ResearchGroupEntity;
import com.mylab.backend.researchgroup.infrastructure.adapters.out.persistence.repository.ResearchGroupJpaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class GroupMemberResearchGroupLookupAdapter implements ResearchGroupLookupPort {

    private final ResearchGroupJpaRepository researchGroupJpaRepository;

    @Override
    public boolean existsById(UUID researchGroupId) {
        log.debug("Checking if research group exists by ID: {}", researchGroupId);
        return researchGroupJpaRepository.existsById(researchGroupId);
    }

    @Override
    public Optional<String> findName(UUID researchGroupId) {
        log.debug("Finding research group name by ID: {}", researchGroupId);
        return researchGroupJpaRepository.findById(researchGroupId).map(ResearchGroupEntity::getName);
    }
}
