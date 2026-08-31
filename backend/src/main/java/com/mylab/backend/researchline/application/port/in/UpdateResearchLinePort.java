package com.mylab.backend.researchline.application.port.in;

import java.util.UUID;

import com.mylab.backend.researchline.application.dto.UpdateResearchLineInput;

public interface UpdateResearchLinePort {
    void update(UUID id, UpdateResearchLineInput input);
}
