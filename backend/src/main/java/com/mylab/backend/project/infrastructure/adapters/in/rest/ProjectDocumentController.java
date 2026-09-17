package com.mylab.backend.project.infrastructure.adapters.in.rest;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mylab.backend.project.application.dto.ProjectDocumentContent;
import com.mylab.backend.project.application.dto.UploadProjectDocumentInput;
import com.mylab.backend.project.application.port.in.DeleteProjectDocumentPort;
import com.mylab.backend.project.application.port.in.DownloadProjectDocumentPort;
import com.mylab.backend.project.application.port.in.UploadProjectDocumentPort;
import com.mylab.backend.project.domain.exception.InvalidProjectDocumentException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ProjectDocumentController {

    private final UploadProjectDocumentPort uploadProjectDocumentPort;
    private final DownloadProjectDocumentPort downloadProjectDocumentPort;
    private final DeleteProjectDocumentPort deleteProjectDocumentPort;

    @PostMapping("/api/v1/projects/{projectId}/documents")
    public ResponseEntity<Void> uploadDocument(
            @PathVariable UUID projectId,
            @RequestParam("file") MultipartFile file) {
        log.info("REST POST: upload document for project: {}", projectId);

        if (file.isEmpty() || file.getOriginalFilename() == null) {
            throw new InvalidProjectDocumentException("file must not be empty");
        }

        UUID documentId;
        try {
            documentId = uploadProjectDocumentPort.upload(new UploadProjectDocumentInput(
                    projectId,
                    file.getOriginalFilename(),
                    file.getContentType() != null ? file.getContentType() : "application/octet-stream",
                    file.getSize(),
                    file.getInputStream()));
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to read uploaded file", e);
        }

        URI location = URI.create("/api/v1/projects/" + projectId + "/documents/" + documentId);
        return ResponseEntity.created(location).build();
    }

    @GetMapping("/api/v1/projects/{projectId}/documents/{documentId}")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable UUID projectId,
            @PathVariable UUID documentId) {
        log.info("REST GET: download document {} for project {}", documentId, projectId);
        ProjectDocumentContent content = downloadProjectDocumentPort.download(projectId, documentId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(content.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + content.fileName() + "\"")
                .contentLength(content.sizeBytes())
                .body(content.resource());
    }

    @DeleteMapping("/api/v1/projects/{projectId}/documents/{documentId}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable UUID projectId,
            @PathVariable UUID documentId) {
        log.info("REST DELETE: delete document {} for project {}", documentId, projectId);
        deleteProjectDocumentPort.delete(projectId, documentId);
        return ResponseEntity.noContent().build();
    }
}
