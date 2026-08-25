package com.mylab.backend.researchgroup.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.researchgroup.application.dto.UpdateResearchGroupInput;
import com.mylab.backend.researchgroup.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.researchgroup.application.port.in.UpdateResearchGroupPort;
import com.mylab.backend.researchgroup.application.port.out.ResearchGroupRepositoryPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UpdateResearchGroupUsecase implements UpdateResearchGroupPort {
    
    private final ResearchGroupRepositoryPort repositoryPort;

    @Override
    @Transactional
    public void update(UUID id, UpdateResearchGroupInput input) {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(input, "input must not be null");
        log.info("Updating research group with ID: {}", id);

        var researchGroup = repositoryPort.findById(id)
        .orElseThrow(() ->
            new ResearchGroupNotFoundException(id)
        );

        researchGroup.updateDetails(
            input.name(),
            input.situation(),
            input.formationYear(),
            input.situationAt(),
            input.lastSubmittedAt(),
            input.predominantArea(),
            input.institutionName(),
            input.institutionUnit(),
            input.sourceUrl(),
            input.repercussions(),
            input.address(),
            input.contact(),
            LocalDateTime.now()
        );

        repositoryPort.save(researchGroup);
        log.info("Research group updated successfully with ID: {}", id);
    }
}
