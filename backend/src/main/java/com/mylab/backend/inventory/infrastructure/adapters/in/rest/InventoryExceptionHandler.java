package com.mylab.backend.inventory.infrastructure.adapters.in.rest;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;
import com.mylab.backend.inventory.application.exception.InventoryItemNotFoundException;
import com.mylab.backend.inventory.application.exception.InventoryLaboratoryNotFoundException;
import com.mylab.backend.inventory.application.exception.ResearchGroupNotFoundException;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;
import com.mylab.backend.researchgroup.infrastructure.adapters.in.rest.exception.ApiErrorResponse;

@RestControllerAdvice
public class InventoryExceptionHandler {

    @ExceptionHandler({
            InventoryItemNotFoundException.class,
            InventoryLaboratoryNotFoundException.class,
            ResearchGroupNotFoundException.class
    })
    public ResponseEntity<ApiErrorResponse> handleNotFound(
            RuntimeException exception,
            HttpServletRequest request
    ) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage(), request);
    }

    @ExceptionHandler(InvalidInventoryException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalid(
            InvalidInventoryException exception,
            HttpServletRequest request
    ) {
        return response(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
    }

    private ResponseEntity<ApiErrorResponse> response(
            HttpStatus status,
            String message,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(status).body(new ApiErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                Map.of()
        ));
    }
}
