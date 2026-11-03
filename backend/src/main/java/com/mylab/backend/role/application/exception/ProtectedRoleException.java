package com.mylab.backend.role.application.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ProtectedRoleException extends RuntimeException {

    public ProtectedRoleException() {
        super("O cargo Admin do grupo não pode ser editado nem removido.");
    }
}
