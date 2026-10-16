package com.vulntrack.dto;

import com.vulntrack.entity.AssetType;
import com.vulntrack.entity.Environment;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Payload for creating or fully updating an asset")
public record AssetRequestDto(
    @Schema(description = "Human-readable asset name", example = "Customer Payment API", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Asset name is required")
    @Size(max = 100, message = "Asset name must not exceed 100 characters")
    String name,

    @Schema(description = "Category of the asset", example = "API", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Asset type is required")
    AssetType type,

    @Schema(description = "Deployment environment of the asset", example = "PRODUCTION", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Environment is required")
    Environment environment,

    @Schema(description = "Optional free-text description of the asset's purpose", example = "REST API handling card payments behind the public gateway")
    @Size(max = 500, message = "Description must not exceed 500 characters")
    String description
) {}
