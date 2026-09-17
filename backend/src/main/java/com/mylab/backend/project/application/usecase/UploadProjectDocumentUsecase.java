package com.mylab.backend.project.application.usecase;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.project.application.dto.UploadProjectDocumentInput;
import com.mylab.backend.project.application.exception.ProjectNotFoundException;
import com.mylab.backend.project.application.port.in.UploadProjectDocumentPort;
import com.mylab.backend.project.application.port.out.FileStoragePort;
import com.mylab.backend.project.application.port.out.ProjectDocumentRepositoryPort;
import com.mylab.backend.project.application.port.out.ProjectRepositoryPort;
import com.mylab.backend.project.domain.model.ProjectDocument;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UploadProjectDocumentUsecase implements UploadProjectDocumentPort {

    private final ProjectRepositoryPort projectRepositoryPort;
    private final ProjectDocumentRepositoryPort documentRepositoryPort;
    private final FileStoragePort fileStoragePort;

    @Override
    @Transactional
    public UUID upload(UploadProjectDocumentInput input) {
        Objects.requireNonNull(input, "input must not be null");
        Objects.requireNonNull(input.projectId(), "projectId must not be null");
        log.info("Uploading document for project: {}", input.projectId());

        if (projectRepositoryPort.findById(input.projectId()).isEmpty()) {
            throw new ProjectNotFoundException(input.projectId());
        }

        String storedPath = fileStoragePort.store(input.projectId(), input.fileName(), input.content());

        ProjectDocument document = ProjectDocument.builder()
                .id(UUID.randomUUID())
                .projectId(input.projectId())
                .fileName(input.fileName())
                .storedPath(storedPath)
                .contentType(input.contentType())
                .sizeBytes(input.sizeBytes())
                .uploadedAt(LocalDateTime.now())
                .build();

        documentRepositoryPort.save(document);
        log.info("Document uploaded successfully with ID: {}", document.getId());
        return document.getId();
    }
}
