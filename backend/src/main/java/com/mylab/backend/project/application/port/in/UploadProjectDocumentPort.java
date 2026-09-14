package com.mylab.backend.project.application.port.in;

import java.util.UUID;

import com.mylab.backend.project.application.dto.UploadProjectDocumentInput;

public interface UploadProjectDocumentPort {
    UUID upload(UploadProjectDocumentInput input);
}
