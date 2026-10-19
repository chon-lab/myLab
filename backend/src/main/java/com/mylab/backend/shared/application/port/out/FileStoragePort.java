package com.mylab.backend.shared.application.port.out;

import java.io.InputStream;
import java.util.UUID;

import org.springframework.core.io.Resource;

public interface FileStoragePort {
    String store(UUID ownerId, String fileName, String contentType, long sizeBytes, InputStream content);
    Resource load(String storedPath);
    void delete(String storedPath);
}
