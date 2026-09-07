package com.mylab.backend.laboratory.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.mylab.backend.laboratory.domain.model.Laboratory;

public interface LaboratoryRepositoryPort {
    void save(Laboratory laboratory);
    Optional<Laboratory> findById(UUID id);
    List<Laboratory> findAllByResearchGroupId(UUID researchGroupId);
}
