package com.mylab.backend.researchgroup.application.port.in;

import java.util.UUID;

public interface DeleteResearchGroupPort {
    void delete(UUID id);
}
