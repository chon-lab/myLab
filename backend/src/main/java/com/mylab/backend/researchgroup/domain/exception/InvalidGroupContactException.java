package com.mylab.backend.researchgroup.domain.exception;

public class InvalidGroupContactException extends IllegalArgumentException {

    public InvalidGroupContactException(String message) {
        super(message);
    }
}
