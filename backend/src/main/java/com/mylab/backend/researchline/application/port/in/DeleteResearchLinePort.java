package com.mylab.backend.researchline.application.port.in;

import java.util.UUID;

public interface DeleteResearchLinePort {
    void delete(UUID id);
}
