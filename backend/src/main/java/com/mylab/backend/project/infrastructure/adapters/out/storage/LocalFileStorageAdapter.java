package com.mylab.backend.project.infrastructure.adapters.out.storage;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import com.mylab.backend.project.application.port.out.FileStoragePort;

@Component
public class LocalFileStorageAdapter implements FileStoragePort {

    private final Path baseDir;

    public LocalFileStorageAdapter(@Value("${mylab.storage.documents-dir:./storage/projects}") String baseDir) {
        this.baseDir = Path.of(baseDir).toAbsolutePath().normalize();
    }

    @Override
    public String store(UUID projectId, String fileName, InputStream content) {
        try {
            Path projectDir = baseDir.resolve(projectId.toString());
            Files.createDirectories(projectDir);

            String sanitizedName = sanitize(fileName);
            Path target = projectDir.resolve(UUID.randomUUID() + "-" + sanitizedName);
            Files.copy(content, target);

            return baseDir.relativize(target).toString();
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store project document", e);
        }
    }

    @Override
    public Resource load(String storedPath) {
        return new FileSystemResource(baseDir.resolve(storedPath));
    }

    @Override
    public void delete(String storedPath) {
        try {
            Files.deleteIfExists(baseDir.resolve(storedPath));
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to delete project document", e);
        }
    }

    private String sanitize(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
