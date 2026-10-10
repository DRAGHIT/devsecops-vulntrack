package com.vulntrack.dto;

import com.vulntrack.entity.AssetType;
import com.vulntrack.entity.Environment;
import java.time.Instant;

public record AssetResponseDto(
    Long id,
    String name,
    AssetType type,
    Environment environment,
    String description,
    Instant createdAt,
    long vulnerabilityCount
) {}
