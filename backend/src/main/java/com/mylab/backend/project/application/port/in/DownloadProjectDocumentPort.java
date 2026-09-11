package com.mylab.backend.project.application.port.in;

import java.util.UUID;

import com.mylab.backend.project.application.dto.ProjectDocumentContent;

public interface DownloadProjectDocumentPort {
    ProjectDocumentContent download(UUID projectId, UUID documentId);
}
