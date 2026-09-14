package com.mylab.backend.project.application.usecase;

import java.util.Objects;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mylab.backend.project.application.dto.ProjectDocumentContent;
import com.mylab.backend.project.application.exception.ProjectDocumentNotFoundException;
import com.mylab.backend.project.application.port.in.DownloadProjectDocumentPort;
import com.mylab.backend.project.application.port.out.FileStoragePort;
import com.mylab.backend.project.application.port.out.ProjectDocumentRepositoryPort;
import com.mylab.backend.project.domain.model.ProjectDocument;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DownloadProjectDocumentUsecase implements DownloadProjectDocumentPort {

    private final ProjectDocumentRepositoryPort documentRepositoryPort;
    private final FileStoragePort fileStoragePort;

    @Override
    @Transactional(readOnly = true)
    public ProjectDocumentContent download(UUID projectId, UUID documentId) {
        Objects.requireNonNull(projectId, "projectId must not be null");
        Objects.requireNonNull(documentId, "documentId must not be null");
        log.debug("Downloading document {} for project {}", documentId, projectId);

        ProjectDocument document = documentRepositoryPort.findByIdAndProjectId(documentId, projectId)
                .orElseThrow(() -> new ProjectDocumentNotFoundException(documentId));

        Resource resource = fileStoragePort.load(document.getStoredPath());
        return new ProjectDocumentContent(
                document.getFileName(), document.getContentType(), document.getSizeBytes(), resource);
    }
}
