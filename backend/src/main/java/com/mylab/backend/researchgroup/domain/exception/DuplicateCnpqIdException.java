package com.mylab.backend.researchgroup.domain.exception;

public class DuplicateCnpqIdException extends RuntimeException {

    public DuplicateCnpqIdException(String cnpqId) {
        super("A research group with CNPq ID " + cnpqId + " already exists");
    }
}
