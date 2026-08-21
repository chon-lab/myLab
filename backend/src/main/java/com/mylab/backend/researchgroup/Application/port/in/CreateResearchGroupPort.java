package com.mylab.backend.researchgroup.Application.port.in;

import com.mylab.backend.researchgroup.domain.model.ResearchGroup;

public interface CreateResearchGroupPort {
    void create(ResearchGroup researchGroup);
}
