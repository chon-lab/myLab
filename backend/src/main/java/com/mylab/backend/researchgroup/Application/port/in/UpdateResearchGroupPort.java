package com.mylab.backend.researchgroup.application.port.in;

import java.util.UUID;

import com.mylab.backend.researchgroup.application.dto.UpdateResearchGroupInput;

public interface UpdateResearchGroupPort {
    void update(UUID id, UpdateResearchGroupInput input);
}
