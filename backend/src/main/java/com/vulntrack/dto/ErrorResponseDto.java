package com.vulntrack.dto;

import java.time.Instant;
import java.util.Map;

public record ErrorResponseDto(
    Instant timestamp,
    int status,
    String error,
    String message,
    String path,
    Map<String, String> validationErrors
) {
    public static ErrorResponseDto of(int status, String error, String message, String path) {
        return new ErrorResponseDto(Instant.now(), status, error, message, path, null);
    }

    public static ErrorResponseDto ofValidation(int status, String error, String message, String path,
                                                Map<String, String> validationErrors) {
        return new ErrorResponseDto(Instant.now(), status, error, message, path, validationErrors);
    }
}
