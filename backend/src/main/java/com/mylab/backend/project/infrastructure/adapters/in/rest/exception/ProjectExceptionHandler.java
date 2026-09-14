package com.mylab.backend.project.infrastructure.adapters.in.rest.exception;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.mylab.backend.project.application.exception.LaboratoryNotFoundException;
import com.mylab.backend.project.application.exception.ProjectDocumentNotFoundException;
import com.mylab.backend.project.application.exception.ProjectNotFoundException;
import com.mylab.backend.project.application.exception.ResearchLineNotFoundException;
import com.mylab.backend.project.domain.exception.InvalidProjectDocumentException;
import com.mylab.backend.project.domain.exception.InvalidProjectException;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class ProjectExceptionHandler {

    @ExceptionHandler({
            ProjectNotFoundException.class,
            LaboratoryNotFoundException.class,
            ResearchLineNotFoundException.class,
            ProjectDocumentNotFoundException.class
    })
    public ResponseEntity<ApiErrorResponse> handleNotFound(
            RuntimeException exception, HttpServletRequest request) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage(), request);
    }

    @ExceptionHandler({InvalidProjectException.class, InvalidProjectDocumentException.class})
    public ResponseEntity<ApiErrorResponse> handleInvalid(
            RuntimeException exception, HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
    }

    private ResponseEntity<ApiErrorResponse> response(
            HttpStatus status, String message, HttpServletRequest request) {
        ApiErrorResponse body = new ApiErrorResponse(
                Instant.now(), status.value(), status.getReasonPhrase(), message, request.getRequestURI(), Map.of());
        return ResponseEntity.status(status).body(body);
    }
}
