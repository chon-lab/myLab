package com.mylab.backend.project.application.port.in;

import java.util.UUID;

public interface DeleteProjectPort {
    void delete(UUID id);
}
