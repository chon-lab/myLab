package com.mylab.backend.project.infrastructure.adapters.out.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "mylab.storage.minio")
public record MinioStorageProperties(String endpoint, String accessKey, String secretKey, String bucket) {
}
