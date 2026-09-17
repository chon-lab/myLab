package com.mylab.backend.project.application.usecase;

import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.project.application.exception.ProjectDocumentNotFoundException;
import com.mylab.backend.project.application.port.in.DeleteProjectDocumentPort;
import com.mylab.backend.project.application.port.out.FileStoragePort;
import com.mylab.backend.project.application.port.out.ProjectDocumentRepositoryPort;
import com.mylab.backend.project.domain.model.ProjectDocument;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeleteProjectDocumentUsecase implements DeleteProjectDocumentPort {

    private final ProjectDocumentRepositoryPort documentRepositoryPort;
    private final FileStoragePort fileStoragePort;

    @Override
    @Transactional
    public void delete(UUID projectId, UUID documentId) {
        Objects.requireNonNull(projectId, "projectId must not be null");
        Objects.requireNonNull(documentId, "documentId must not be null");
        log.info("Deleting document {} for project {}", documentId, projectId);

        ProjectDocument document = documentRepositoryPort.findByIdAndProjectId(documentId, projectId)
                .orElseThrow(() -> new ProjectDocumentNotFoundException(documentId));

        documentRepositoryPort.deleteById(document.getId());
        fileStoragePort.delete(document.getStoredPath());
    }
}
