package com.mylab.backend.researchline.infrastructure.adapters.in.rest.exception;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.mylab.backend.researchline.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.researchline.application.exception.ResearchLineNotFoundException;
import com.mylab.backend.researchline.domain.exception.InvalidResearchLineException;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Named distinctly from research-group's {@code GlobalExceptionHandler} to avoid a Spring
 * bean name collision (both are {@code @RestControllerAdvice}, auto-named from the simple
 * class name). Handles only research-line-specific exceptions: generic exceptions shared
 * across the whole API (validation, malformed requests, data integrity) are already handled
 * globally by {@link com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.exception.GlobalExceptionHandler},
 * whose {@code @RestControllerAdvice} is unscoped and therefore applies to every controller.
 * Duplicating those handlers here would make Spring's exception resolution ambiguous.
 */
@RestControllerAdvice
public class ResearchLineExceptionHandler {

    @ExceptionHandler(ResearchLineNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResearchLineNotFound(
            ResearchLineNotFoundException exception,
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

    @ExceptionHandler(InvalidResearchLineException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidDomain(
            InvalidResearchLineException exception,
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
