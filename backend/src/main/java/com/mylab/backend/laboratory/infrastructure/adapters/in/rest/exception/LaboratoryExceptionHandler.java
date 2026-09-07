package com.mylab.backend.laboratory.infrastructure.adapters.in.rest.exception;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.mylab.backend.laboratory.application.exception.LaboratoryNotFoundException;
import com.mylab.backend.laboratory.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.laboratory.domain.exception.InvalidLaboratoryException;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class LaboratoryExceptionHandler {

    @ExceptionHandler(LaboratoryNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleLaboratoryNotFound(
            LaboratoryNotFoundException exception, HttpServletRequest request) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage(), request);
    }

    @ExceptionHandler(ResearchGroupNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResearchGroupNotFound(
            ResearchGroupNotFoundException exception, HttpServletRequest request) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage(), request);
    }

    @ExceptionHandler(InvalidLaboratoryException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidLaboratory(
            InvalidLaboratoryException exception, HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
    }

    private ResponseEntity<ApiErrorResponse> response(
            HttpStatus status, String message, HttpServletRequest request) {
        ApiErrorResponse body = new ApiErrorResponse(
                Instant.now(), status.value(), status.getReasonPhrase(), message, request.getRequestURI(), Map.of());
        return ResponseEntity.status(status).body(body);
    }
}
