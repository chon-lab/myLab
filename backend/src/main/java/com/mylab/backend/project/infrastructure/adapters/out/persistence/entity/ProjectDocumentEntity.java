package com.mylab.backend.project.infrastructure.adapters.out.persistence.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "project_document",
        indexes = @Index(name = "idx_project_document_project", columnList = "project_id")
)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProjectDocumentEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "project_id", nullable = false, updatable = false)
    private UUID projectId;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "stored_path", nullable = false, length = 500)
    private String storedPath;

    @Column(name = "content_type", nullable = false, length = 150)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;
}
