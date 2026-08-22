package com.mylab.backend.researchgroup.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import com.mylab.backend.researchgroup.application.dto.UpdateResearchGroupInput;
import com.mylab.backend.researchgroup.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.researchgroup.application.port.in.UpdateResearchGroupPort;
import com.mylab.backend.researchgroup.application.port.out.ResearchGroupRepositoryPort;

public class UpdateResearchGroupUsecase implements UpdateResearchGroupPort {
    
    private final ResearchGroupRepositoryPort repository;

    public UpdateResearchGroupUsecase(ResearchGroupRepositoryPort repository) {
        this.repository = repository;
    } 

    @Override
    public void update(UUID id, UpdateResearchGroupInput input) {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(input, "input must not be null");

        var researchGroup = repository.findById(id)
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

        repository.save(researchGroup);
    }
}