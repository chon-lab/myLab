package com.mylab.backend.project.domain.exception;

public class InvalidProjectException extends IllegalArgumentException {

    public InvalidProjectException(String message) {
        super(message);
    }
}
