package com.mylab.backend.researchgroup.application.port.out;

import java.util.List;
import java.util.UUID;

import com.mylab.backend.researchgroup.domain.model.ResearchGroup;

public interface ResearchGroupRepositoryPort {
    ResearchGroup save(ResearchGroup researchGroup);
    ResearchGroup update(UUID id, ResearchGroup researchGroup);
    ResearchGroup findById(UUID id);
    List<ResearchGroup> findAll();
    void delete(UUID id);
}
