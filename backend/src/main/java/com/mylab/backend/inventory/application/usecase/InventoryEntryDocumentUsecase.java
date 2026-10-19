package com.mylab.backend.inventory.application.usecase;

import java.io.ByteArrayInputStream;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import com.mylab.backend.inventory.application.dto.CreateInventoryEntryDocumentInput;
import com.mylab.backend.inventory.application.dto.InventoryEntryDocumentContent;
import com.mylab.backend.inventory.application.dto.UploadInventoryEntryDocumentInput;
import com.mylab.backend.inventory.application.exception.InventoryEntryDocumentNotFoundException;
import com.mylab.backend.inventory.application.exception.InventoryEntryNotFoundException;
import com.mylab.backend.inventory.application.port.out.InventoryEntryDocumentRepositoryPort;
import com.mylab.backend.inventory.application.port.out.InventoryMovementRepositoryPort;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;
import com.mylab.backend.inventory.domain.model.InventoryEntryDocument;
import com.mylab.backend.inventory.domain.model.InventoryMovement;
import com.mylab.backend.inventory.domain.model.InventoryMovementType;
import com.mylab.backend.shared.application.port.out.FileStoragePort;

@Service
@RequiredArgsConstructor
public class InventoryEntryDocumentUsecase {
    private final InventoryMovementRepositoryPort movementRepository;
    private final InventoryEntryDocumentRepositoryPort documentRepository;
    private final FileStoragePort fileStorage;

    @Transactional
    public InventoryEntryDocument createMetadata(UUID entryId, CreateInventoryEntryDocumentInput input) {
        requireEntry(entryId);
        String documentNumber = normalize(input.documentNumber());
        String issuer = normalize(input.issuer());
        if (documentNumber == null && issuer == null && input.documentDate() == null) {
            throw new InvalidInventoryException("At least one document metadata field is required");
        }
        InventoryEntryDocument document = new InventoryEntryDocument(UUID.randomUUID(), entryId,
                documentNumber, issuer, input.documentDate(), null, null, null, null, null, LocalDateTime.now());
        documentRepository.save(document);
        return document;
    }

    @Transactional
    public InventoryEntryDocument createWithFile(UUID entryId, UploadInventoryEntryDocumentInput input) {
        requireEntry(entryId);
        validateUpload(input);
        UUID documentId = UUID.randomUUID();
        String checksum = checksum(input.content());
        String objectKey = fileStorage.store(entryId, input.fileName(), input.contentType(), input.content().length,
                new ByteArrayInputStream(input.content()));
        InventoryEntryDocument document = new InventoryEntryDocument(documentId, entryId,
                normalize(input.documentNumber()), normalize(input.issuer()), input.documentDate(),
                input.fileName(), objectKey, input.contentType(), (long) input.content().length, checksum,
                LocalDateTime.now());
        saveAndCleanObject(document, objectKey);
        return document;
    }

    @Transactional
    public InventoryEntryDocument attachFile(UUID entryId, UUID documentId, UploadInventoryEntryDocumentInput input) {
        requireEntry(entryId);
        validateUpload(input);
        InventoryEntryDocument document = documentRepository.findByIdAndEntryId(documentId, entryId)
                .orElseThrow(() -> new InventoryEntryDocumentNotFoundException(documentId));
        if (document.hasFile()) {
            throw new InvalidInventoryException("This inventory document already has an attached file");
        }
        String checksum = checksum(input.content());
        String objectKey = fileStorage.store(entryId, input.fileName(), input.contentType(), input.content().length,
                new ByteArrayInputStream(input.content()));
        InventoryEntryDocument updated = document.withFile(input.fileName(), objectKey, input.contentType(),
                input.content().length, checksum);
        try {
            documentRepository.save(updated);
        } catch (RuntimeException exception) {
            cleanObject(objectKey, exception);
            throw exception;
        }
        return updated;
    }

    @Transactional(readOnly = true)
    public List<InventoryEntryDocument> list(UUID entryId) {
        requireEntry(entryId);
        return documentRepository.findAllByEntryId(entryId);
    }

    @Transactional(readOnly = true)
    public InventoryEntryDocument get(UUID entryId, UUID documentId) {
        requireEntry(entryId);
        return documentRepository.findByIdAndEntryId(documentId, entryId)
                .orElseThrow(() -> new InventoryEntryDocumentNotFoundException(documentId));
    }

    @Transactional(readOnly = true)
    public InventoryEntryDocumentContent download(UUID entryId, UUID documentId) {
        InventoryEntryDocument document = get(entryId, documentId);
        if (!document.hasFile()) {
            throw new InvalidInventoryException("This inventory document has no attached file");
        }
        Resource resource = fileStorage.load(document.storedPath());
        return new InventoryEntryDocumentContent(document.fileName(), document.contentType(),
                document.sizeBytes(), resource);
    }

    @Transactional
    public void delete(UUID entryId, UUID documentId) {
        requireEntry(entryId);
        InventoryEntryDocument document = documentRepository.findByIdAndEntryId(documentId, entryId)
                .orElseThrow(() -> new InventoryEntryDocumentNotFoundException(documentId));
        documentRepository.deleteById(document.id());
        if (document.hasFile()) {
            fileStorage.delete(document.storedPath());
        }
    }

    private void requireEntry(UUID entryId) {
        if (movementRepository.findById(entryId)
                .filter(movement -> movement.type() == InventoryMovementType.ENTRY).isEmpty()) {
            throw new InventoryEntryNotFoundException(entryId);
        }
    }

    private void validateUpload(UploadInventoryEntryDocumentInput input) {
        if (input == null || input.content() == null || input.content().length == 0) {
            throw new InvalidInventoryException("file must not be empty");
        }
        if (normalize(input.fileName()) == null) {
            throw new InvalidInventoryException("fileName must not be blank");
        }
        if (normalize(input.contentType()) == null) {
            throw new InvalidInventoryException("contentType must not be blank");
        }
        if (input.fileName().length() > 255 || input.contentType().length() > 150) {
            throw new InvalidInventoryException("File name or content type exceeds the supported length");
        }
    }

    private String checksum(byte[] content) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content));
        } catch (Exception exception) {
            throw new IllegalStateException("Could not calculate document checksum", exception);
        }
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void saveAndCleanObject(InventoryEntryDocument document, String objectKey) {
        try {
            documentRepository.save(document);
        } catch (RuntimeException exception) {
            cleanObject(objectKey, exception);
            throw exception;
        }
    }

    private void cleanObject(String objectKey, RuntimeException exception) {
        try {
            fileStorage.delete(objectKey);
        } catch (RuntimeException cleanupException) {
            exception.addSuppressed(cleanupException);
        }
    }
}
