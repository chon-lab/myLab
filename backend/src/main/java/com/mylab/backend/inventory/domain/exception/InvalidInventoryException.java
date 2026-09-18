package com.mylab.backend.inventory.domain.exception;

public class InvalidInventoryException extends RuntimeException {

    public InvalidInventoryException(String message) {
        super(message);
    }
}
