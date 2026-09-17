package com.mylab.backend.project.domain.exception;

public class InvalidProjectDocumentException extends IllegalArgumentException {

    public InvalidProjectDocumentException(String message) {
        super(message);
    }
}
