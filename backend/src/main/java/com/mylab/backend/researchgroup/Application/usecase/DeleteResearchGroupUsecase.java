package com.mylab.backend.researchgroup.application.usecase;

import java.util.Objects;
import java.util.UUID;

import com.mylab.backend.researchgroup.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.researchgroup.application.port.in.DeleteResearchGroupPort;
import com.mylab.backend.researchgroup.application.port.out.ResearchGroupRepositoryPort;

public class DeleteResearchGroupUsecase implements DeleteResearchGroupPort {

    private final ResearchGroupRepositoryPort repository;

    public DeleteResearchGroupUsecase(ResearchGroupRepositoryPort repository) {
        this.repository = repository;
    }

    @Override
    public void delete(UUID id) {
        Objects.requireNonNull(id, "id must not be null");

       if (repository.findById(id).isEmpty()) {
            throw new ResearchGroupNotFoundException(id);
       }
        repository.deleteById(id);
    }
}