package com.mylab.backend.researchgroup.Application.port.in;

import java.util.UUID;

public interface DeleteResearchGroupPort {
    void delete(UUID id);
}
