package com.mylab.backend.role.application.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class RoleInUseException extends RuntimeException {

    public RoleInUseException(long memberCount) {
        super("Cargo em uso por " + memberCount + " membro(s); reatribua-os antes de remover.");
    }
}
