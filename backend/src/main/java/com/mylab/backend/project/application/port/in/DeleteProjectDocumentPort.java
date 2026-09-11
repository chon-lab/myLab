package com.mylab.backend.project.application.port.in;

import java.util.UUID;

public interface DeleteProjectDocumentPort {
    void delete(UUID projectId, UUID documentId);
}
