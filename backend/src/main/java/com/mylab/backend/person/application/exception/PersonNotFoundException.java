package com.mylab.backend.person.application.exception;

import java.util.UUID;

public class PersonNotFoundException extends RuntimeException {

    public PersonNotFoundException(UUID personId) {
        super("Person " + personId + " was not found");
    }
}
