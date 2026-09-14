package com.mylab.backend.project.application.dto;

import org.springframework.core.io.Resource;

public record ProjectDocumentContent(
        String fileName,
        String contentType,
        long sizeBytes,
        Resource resource
) {}
