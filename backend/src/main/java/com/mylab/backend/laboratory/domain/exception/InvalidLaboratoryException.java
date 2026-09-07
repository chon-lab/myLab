package com.mylab.backend.laboratory.domain.exception;

public class InvalidLaboratoryException extends IllegalArgumentException {

    public InvalidLaboratoryException(String message) {
        super(message);
    }
}
