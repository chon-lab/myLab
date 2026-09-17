package com.mylab.backend.project.application.exception;

import java.util.UUID;

public class ProjectDocumentNotFoundException extends RuntimeException {

    public ProjectDocumentNotFoundException(UUID documentId) {
        super("Project document " + documentId + " was not found");
    }
}
