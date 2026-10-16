package com.vulntrack.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.Map;

@Schema(description = "Standard error envelope returned for every non-2xx response")
public record ErrorResponseDto(
    @Schema(description = "UTC timestamp when the error occurred", example = "2026-10-10T14:30:00Z")
    Instant timestamp,
    @Schema(description = "HTTP status code", example = "400")
    int status,
    @Schema(description = "HTTP reason phrase", example = "Bad Request")
    String error,
    @Schema(description = "Machine-readable error code for programmatic handling",
            example = "VALIDATION_FAILED",
            allowableValues = {"RESOURCE_NOT_FOUND", "BAD_REQUEST", "VALIDATION_FAILED", "FORBIDDEN", "INTERNAL_SERVER_ERROR"})
    String code,
    @Schema(description = "Human-readable error message", example = "Input payload failed validation constraints")
    String message,
    @Schema(description = "Request path that produced the error", example = "/api/assets")
    String path,
    @Schema(description = "Field-level validation errors, present only for 400 validation failures")
    Map<String, String> validationErrors
) {
    public static ErrorResponseDto of(int status, String error, String code, String message, String path) {
        return new ErrorResponseDto(Instant.now(), status, error, code, message, path, null);
    }

    public static ErrorResponseDto ofValidation(int status, String error, String code, String message, String path,
                                                Map<String, String> validationErrors) {
        return new ErrorResponseDto(Instant.now(), status, error, code, message, path, validationErrors);
    }
}
