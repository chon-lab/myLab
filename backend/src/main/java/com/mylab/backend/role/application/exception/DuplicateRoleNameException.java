package com.mylab.backend.role.application.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateRoleNameException extends RuntimeException {

    public DuplicateRoleNameException(String name) {
        super("Já existe um cargo com o nome '" + name + "' neste grupo.");
    }
}
