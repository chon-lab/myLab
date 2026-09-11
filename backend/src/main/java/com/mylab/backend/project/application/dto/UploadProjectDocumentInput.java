package com.mylab.backend.project.application.dto;

import java.io.InputStream;
import java.util.UUID;

public record UploadProjectDocumentInput(
        UUID projectId,
        String fileName,
        String contentType,
        long sizeBytes,
        InputStream content
) {}
