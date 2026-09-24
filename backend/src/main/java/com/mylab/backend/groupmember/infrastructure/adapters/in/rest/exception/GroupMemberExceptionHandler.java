package com.mylab.backend.groupmember.infrastructure.adapters.in.rest.exception;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.mylab.backend.groupmember.application.exception.GroupMemberAlreadyActiveException;
import com.mylab.backend.groupmember.application.exception.GroupMemberNotFoundException;
import com.mylab.backend.groupmember.application.exception.PersonNotFoundException;
import com.mylab.backend.groupmember.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.groupmember.application.exception.ResearchLineNotFoundException;
import com.mylab.backend.groupmember.domain.exception.InvalidGroupMemberException;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GroupMemberExceptionHandler {

    @ExceptionHandler(GroupMemberNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleGroupMemberNotFound(
            GroupMemberNotFoundException exception,
            HttpServletRequest request
    ) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(ResearchGroupNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResearchGroupNotFound(
            ResearchGroupNotFoundException exception,
            HttpServletRequest request
    ) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(PersonNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handlePersonNotFound(
            PersonNotFoundException exception,
            HttpServletRequest request
    ) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(ResearchLineNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResearchLineNotFound(
            ResearchLineNotFoundException exception,
            HttpServletRequest request
    ) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(GroupMemberAlreadyActiveException.class)
    public ResponseEntity<ApiErrorResponse> handleAlreadyActive(
            GroupMemberAlreadyActiveException exception,
            HttpServletRequest request
    ) {
        return response(HttpStatus.CONFLICT, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(InvalidGroupMemberException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidDomain(
            InvalidGroupMemberException exception,
            HttpServletRequest request
    ) {
        return response(HttpStatus.BAD_REQUEST, exception.getMessage(), request, Map.of());
    }

    private ResponseEntity<ApiErrorResponse> response(
            HttpStatus status,
            String message,
            HttpServletRequest request,
            Map<String, String> fieldErrors
    ) {
        ApiErrorResponse body = new ApiErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                fieldErrors
        );

        return ResponseEntity.status(status).body(body);
    }
}
