package com.mylab.backend.researchline.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.mylab.backend.researchline.domain.model.ResearchLine;

public interface ResearchLineRepositoryPort {
    void save(ResearchLine researchLine);
    Optional<ResearchLine> findById(UUID id);
    List<ResearchLine> findAllByResearchGroupId(UUID researchGroupId);
    void deleteById(UUID id);
}
