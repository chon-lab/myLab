package com.mylab.backend.researchgroup.application.usecase;

import java.util.Objects;
import java.util.UUID;

import com.mylab.backend.researchgroup.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.researchgroup.application.port.in.GetResearchGroupPort;
import com.mylab.backend.researchgroup.application.port.out.ResearchGroupRepositoryPort;
import com.mylab.backend.researchgroup.domain.model.ResearchGroup;

public class GetResearchGroupByIdUsecase implements GetResearchGroupPort {

    private final ResearchGroupRepositoryPort repository;

    public GetResearchGroupByIdUsecase(ResearchGroupRepositoryPort repository) {
        this.repository = repository;
    }

    @Override
    public ResearchGroup get(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        return repository.findById(id)
        .orElseThrow(() ->
            new ResearchGroupNotFoundException(id)
        );
    }
    
}