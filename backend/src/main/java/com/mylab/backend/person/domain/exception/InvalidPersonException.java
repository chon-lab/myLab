package com.mylab.backend.person.domain.exception;

public class InvalidPersonException extends IllegalArgumentException {

    public InvalidPersonException(String message) {
        super(message);
    }
}
