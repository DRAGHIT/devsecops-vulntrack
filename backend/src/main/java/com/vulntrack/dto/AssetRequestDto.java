package com.vulntrack.dto;

import com.vulntrack.entity.AssetType;
import com.vulntrack.entity.Environment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AssetRequestDto(
    @NotBlank(message = "Asset name is required")
    @Size(max = 100, message = "Asset name must not exceed 100 characters")
    String name,

    @NotNull(message = "Asset type is required")
    AssetType type,

    @NotNull(message = "Environment is required")
    Environment environment,

    @Size(max = 500, message = "Description must not exceed 500 characters")
    String description
) {}
