package com.mylab.backend.researchgroup.application.usecase;

import java.util.List;

import com.mylab.backend.researchgroup.application.port.in.GetAllResearchGroupPort;
import com.mylab.backend.researchgroup.application.port.out.ResearchGroupRepositoryPort;
import com.mylab.backend.researchgroup.domain.model.ResearchGroup;

public class GetAllResearchGroupsUsecase implements GetAllResearchGroupPort {

    private final ResearchGroupRepositoryPort repository;

    public GetAllResearchGroupsUsecase(ResearchGroupRepositoryPort repository) {
        this.repository = repository;
    }

    @Override
    public List<ResearchGroup> getAll() {
        return repository.findAll();
    }
}