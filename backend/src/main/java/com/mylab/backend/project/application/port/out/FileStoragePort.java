package com.mylab.backend.project.application.port.out;

import java.io.InputStream;
import java.util.UUID;

import org.springframework.core.io.Resource;

public interface FileStoragePort {
    String store(UUID projectId, String fileName, InputStream content);
    Resource load(String storedPath);
    void delete(String storedPath);
}
