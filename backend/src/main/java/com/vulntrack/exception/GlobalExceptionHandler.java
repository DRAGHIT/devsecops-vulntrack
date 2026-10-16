package com.vulntrack.exception;

import com.vulntrack.dto.ErrorResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleResourceNotFound(ResourceNotFoundException ex,
                                                                   HttpServletRequest request) {
        log.warn("Resource not found: {} on path {}", ex.getMessage(), request.getRequestURI());
        ErrorResponseDto error = ErrorResponseDto.of(
            HttpStatus.NOT_FOUND.value(),
            "Not Found",
            "RESOURCE_NOT_FOUND",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponseDto> handleBadRequest(BadRequestException ex,
                                                             HttpServletRequest request) {
        log.warn("Bad request: {} on path {}", ex.getMessage(), request.getRequestURI());
        ErrorResponseDto error = ErrorResponseDto.of(
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            "BAD_REQUEST",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> handleValidationErrors(MethodArgumentNotValidException ex,
                                                                  HttpServletRequest request) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        log.warn("Validation failed for request on path {}: {}", request.getRequestURI(), fieldErrors);
        ErrorResponseDto error = ErrorResponseDto.ofValidation(
            HttpStatus.BAD_REQUEST.value(),
            "Validation Failed",
            "VALIDATION_FAILED",
            "Input payload failed validation constraints",
            request.getRequestURI(),
            fieldErrors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDto> handleAccessDenied(AccessDeniedException ex,
                                                               HttpServletRequest request) {
        log.warn("Access denied on path {}: {}", request.getRequestURI(), ex.getMessage());
        ErrorResponseDto error = ErrorResponseDto.of(
            HttpStatus.FORBIDDEN.value(),
            "Forbidden",
            "FORBIDDEN",
            "You do not have permission to perform this action",
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDto> handleIllegalArgument(IllegalArgumentException ex,
                                                                 HttpServletRequest request) {
        log.warn("Illegal argument on path {}: {}", request.getRequestURI(), ex.getMessage());
        ErrorResponseDto error = ErrorResponseDto.of(
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            "BAD_REQUEST",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponseDto> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
                                                               HttpServletRequest request) {
        String message = String.format("Parameter '%s' has invalid value '%s'; expected type %s",
            ex.getName(), ex.getValue(), ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");
        log.warn("Type mismatch on path {}: {}", request.getRequestURI(), message);
        ErrorResponseDto error = ErrorResponseDto.of(
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            "BAD_REQUEST",
            message,
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGenericException(Exception ex,
                                                                   HttpServletRequest request) {
        // Log full stack trace internally for debugging, but NEVER leak internal details in response
        log.error("Unhandled server exception on path {}: ", request.getRequestURI(), ex);
        ErrorResponseDto error = ErrorResponseDto.of(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Internal Server Error",
            "INTERNAL_SERVER_ERROR",
            "An unexpected error occurred while processing the request",
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
