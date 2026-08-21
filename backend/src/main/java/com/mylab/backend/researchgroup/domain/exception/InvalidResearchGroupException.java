package com.mylab.backend.researchgroup.domain.exception;

public class InvalidResearchGroupException extends IllegalArgumentException {

    public InvalidResearchGroupException(String message) {
        super(message);
    }
}
