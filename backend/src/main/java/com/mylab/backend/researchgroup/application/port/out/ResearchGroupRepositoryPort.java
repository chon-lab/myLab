package com.mylab.backend.researchgroup.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.mylab.backend.researchgroup.domain.model.ResearchGroup;

public interface ResearchGroupRepositoryPort {
    void save(ResearchGroup researchGroup);
    Optional<ResearchGroup> findById(UUID id);
    boolean existsByCnpqId(String cnpqId);
    List<ResearchGroup> findAll();
    void deleteById(UUID id);
}
