package com.mylab.backend.project.infrastructure.adapters.out.storage;

import java.io.InputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import com.mylab.backend.shared.application.port.out.FileStoragePort;

@Component
public class MinioFileStorageAdapter implements FileStoragePort {

    private static final long PART_SIZE = 10L * 1024 * 1024;

    private final MinioClient minioClient;
    private final MinioStorageProperties properties;
    private final Path legacyBaseDir;

    public MinioFileStorageAdapter(
            MinioClient minioClient,
            MinioStorageProperties properties,
            @Value("${mylab.storage.documents-dir:./storage/projects}") String legacyBaseDir
    ) {
        this.minioClient = minioClient;
        this.properties = properties;
        this.legacyBaseDir = Path.of(legacyBaseDir).toAbsolutePath().normalize();
    }

    @Override
    public String store(UUID ownerId, String fileName, String contentType, long sizeBytes, InputStream content) {
        String objectKey = "documents/" + ownerId + "/" + UUID.randomUUID();
        try {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(properties.bucket())
                    .object(objectKey)
                    .stream(content, sizeBytes, PART_SIZE)
                    .contentType(contentType)
                    .build());
            return objectKey;
        } catch (Exception exception) {
            throw new IllegalStateException("Could not store document in MinIO", exception);
        }
    }

    @Override
    public Resource load(String objectKey) {
        if (!objectKey.startsWith("documents/")) {
            Path legacyFile = legacyBaseDir.resolve(objectKey).normalize();
            if (!legacyFile.startsWith(legacyBaseDir) || !Files.isRegularFile(legacyFile)) {
                throw new IllegalStateException("Legacy project document was not found");
            }
            return new FileSystemResource(legacyFile);
        }
        try {
            InputStream content = minioClient.getObject(GetObjectArgs.builder()
                    .bucket(properties.bucket())
                    .object(objectKey)
                    .build());
            return new InputStreamResource(content);
        } catch (Exception exception) {
            throw new IllegalStateException("Could not load document from MinIO", exception);
        }
    }

    @Override
    public void delete(String objectKey) {
        if (!objectKey.startsWith("documents/")) {
            Path legacyFile = legacyBaseDir.resolve(objectKey).normalize();
            if (!legacyFile.startsWith(legacyBaseDir)) {
                throw new IllegalStateException("Invalid legacy document path");
            }
            try {
                Files.deleteIfExists(legacyFile);
                return;
            } catch (IOException exception) {
                throw new UncheckedIOException("Could not delete legacy project document", exception);
            }
        }
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(properties.bucket())
                    .object(objectKey)
                    .build());
        } catch (Exception exception) {
            throw new IllegalStateException("Could not delete document from MinIO", exception);
        }
    }
}
