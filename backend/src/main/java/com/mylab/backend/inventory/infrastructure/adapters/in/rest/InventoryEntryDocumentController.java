package com.mylab.backend.inventory.infrastructure.adapters.in.rest;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.CreateInventoryEntryDocumentInput;
import com.mylab.backend.inventory.application.dto.InventoryEntryDocumentContent;
import com.mylab.backend.inventory.application.dto.UploadInventoryEntryDocumentInput;
import com.mylab.backend.inventory.application.usecase.InventoryEntryDocumentUsecase;
import com.mylab.backend.inventory.domain.model.InventoryEntryDocument;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.CreateInventoryEntryDocumentRequest;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.InventoryEntryDocumentResponse;

@RestController
@RequiredArgsConstructor
public class InventoryEntryDocumentController {
    private final InventoryEntryDocumentUsecase usecase;

    @GetMapping("/api/v1/inventory/entries/{entryId}/documents")
    public List<InventoryEntryDocumentResponse> list(@PathVariable UUID entryId) {
        return usecase.list(entryId).stream().map(this::toResponse).toList();
    }

    @PostMapping("/api/v1/inventory/entries/{entryId}/documents")
    public ResponseEntity<InventoryEntryDocumentResponse> createMetadata(
            @PathVariable UUID entryId,
            @Valid @RequestBody CreateInventoryEntryDocumentRequest request
    ) {
        InventoryEntryDocument document = usecase.createMetadata(entryId,
                new CreateInventoryEntryDocumentInput(request.documentNumber(), request.issuer(), request.documentDate()));
        return documentLocation(entryId, document.id()).body(toResponse(document));
    }

    @PostMapping(value = "/api/v1/inventory/entries/{entryId}/documents/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<InventoryEntryDocumentResponse> createWithFile(
            @PathVariable UUID entryId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String documentNumber,
            @RequestParam(required = false) String issuer,
            @RequestParam(required = false) java.time.LocalDate documentDate
    ) {
        InventoryEntryDocument document = usecase.createWithFile(entryId, toInput(file, documentNumber, issuer, documentDate));
        return documentLocation(entryId, document.id()).body(toResponse(document));
    }

    @GetMapping("/api/v1/inventory/entries/{entryId}/documents/{documentId}")
    public InventoryEntryDocumentResponse get(
            @PathVariable UUID entryId,
            @PathVariable UUID documentId
    ) {
        return toResponse(usecase.get(entryId, documentId));
    }

    @PutMapping(value = "/api/v1/inventory/entries/{entryId}/documents/{documentId}/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public InventoryEntryDocumentResponse attachFile(
            @PathVariable UUID entryId,
            @PathVariable UUID documentId,
            @RequestParam("file") MultipartFile file
    ) {
        InventoryEntryDocument current = usecase.get(entryId, documentId);
        return toResponse(usecase.attachFile(entryId, documentId,
                toInput(file, current.documentNumber(), current.issuer(), current.documentDate())));
    }

    @GetMapping("/api/v1/inventory/entries/{entryId}/documents/{documentId}/file")
    public ResponseEntity<Resource> download(
            @PathVariable UUID entryId,
            @PathVariable UUID documentId
    ) {
        InventoryEntryDocumentContent content = usecase.download(entryId, documentId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(content.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(content.fileName(), StandardCharsets.UTF_8).build().toString())
                .contentLength(content.sizeBytes())
                .body(content.resource());
    }

    @DeleteMapping("/api/v1/inventory/entries/{entryId}/documents/{documentId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID entryId,
            @PathVariable UUID documentId
    ) {
        usecase.delete(entryId, documentId);
        return ResponseEntity.noContent().build();
    }

    private UploadInventoryEntryDocumentInput toInput(
            MultipartFile file,
            String documentNumber,
            String issuer,
            java.time.LocalDate documentDate
    ) {
        if (file.isEmpty() || file.getOriginalFilename() == null) {
            throw new com.mylab.backend.inventory.domain.exception.InvalidInventoryException("file must not be empty");
        }
        try {
            return new UploadInventoryEntryDocumentInput(documentNumber, issuer, documentDate,
                    file.getOriginalFilename(), file.getContentType() == null ? "application/octet-stream" : file.getContentType(),
                    file.getBytes());
        } catch (IOException exception) {
            throw new UncheckedIOException("Failed to read uploaded file", exception);
        }
    }

    private ResponseEntity.BodyBuilder documentLocation(UUID entryId, UUID documentId) {
        return ResponseEntity.created(URI.create("/api/v1/inventory/entries/" + entryId + "/documents/" + documentId));
    }

    private InventoryEntryDocumentResponse toResponse(InventoryEntryDocument document) {
        return new InventoryEntryDocumentResponse(document.id(), document.documentNumber(), document.issuer(),
                document.documentDate(), document.fileName(), document.contentType(), document.sizeBytes(),
                document.checksumSha256(), document.uploadedAt(), document.hasFile());
    }
}
