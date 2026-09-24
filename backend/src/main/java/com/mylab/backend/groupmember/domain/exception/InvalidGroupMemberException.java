package com.mylab.backend.groupmember.domain.exception;

public class InvalidGroupMemberException extends IllegalArgumentException {

    public InvalidGroupMemberException(String message) {
        super(message);
    }
}
