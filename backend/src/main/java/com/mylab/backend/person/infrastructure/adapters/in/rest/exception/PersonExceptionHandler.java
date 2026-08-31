package com.mylab.backend.person.infrastructure.adapters.in.rest.exception;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.mylab.backend.person.application.exception.PersonNotFoundException;
import com.mylab.backend.person.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.person.application.exception.ResearchLineNotFoundException;
import com.mylab.backend.person.domain.exception.InvalidPersonException;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Named distinctly (not {@code GlobalExceptionHandler}) to avoid the Spring bean name
 * collision documented for the research-line module: {@code @RestControllerAdvice} beans
 * are auto-named from their simple class name, so every module needs its own name here.
 * Handles only person-specific exceptions; generic ones (validation, malformed requests,
 * data integrity) are already covered globally by research-group's unscoped
 * {@link com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.exception.GlobalExceptionHandler}.
 */
@RestControllerAdvice
public class PersonExceptionHandler {

    @ExceptionHandler(PersonNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handlePersonNotFound(
            PersonNotFoundException exception,
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

    @ExceptionHandler(ResearchLineNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResearchLineNotFound(
            ResearchLineNotFoundException exception,
            HttpServletRequest request
    ) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(InvalidPersonException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidDomain(
            InvalidPersonException exception,
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
