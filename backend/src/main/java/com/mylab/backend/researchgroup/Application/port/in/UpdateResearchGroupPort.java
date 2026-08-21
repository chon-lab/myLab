package com.mylab.backend.researchgroup.Application.port.in;

import java.util.UUID;

import com.mylab.backend.researchgroup.domain.model.ResearchGroup;

public interface UpdateResearchGroupPort {
    void update(UUID id, ResearchGroup researchGroup);
}
