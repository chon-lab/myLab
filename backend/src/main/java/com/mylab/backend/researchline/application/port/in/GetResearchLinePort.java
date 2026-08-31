package com.mylab.backend.researchline.application.port.in;

import java.util.UUID;

import com.mylab.backend.researchline.domain.model.ResearchLine;

public interface GetResearchLinePort {
    ResearchLine get(UUID id);
}
