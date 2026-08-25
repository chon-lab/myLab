package com.mylab.backend.researchgroup.domain.exception;

public class InvalidGroupAddressException extends IllegalArgumentException {

    public InvalidGroupAddressException(String message) {
        super(message);
    }
}
