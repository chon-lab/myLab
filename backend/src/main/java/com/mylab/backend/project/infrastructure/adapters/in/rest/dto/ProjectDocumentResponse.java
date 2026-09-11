package com.mylab.backend.project.infrastructure.adapters.in.rest.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectDocumentResponse {
    private UUID id;
    private String fileName;
    private String contentType;
    private long sizeBytes;
    private LocalDateTime uploadedAt;
}
