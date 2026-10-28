package com.mylab.backend.common.infrastructure.auth;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnresolvedCurrentPersonException extends RuntimeException {

    public UnresolvedCurrentPersonException(String message) {
        super(message);
    }
}
