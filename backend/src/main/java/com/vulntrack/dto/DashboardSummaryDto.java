package com.vulntrack.dto;

import java.util.List;
import java.util.Map;

public record DashboardSummaryDto(
    long totalAssets,
    long openVulnerabilities,
    long criticalVulnerabilities,
    long fixedVulnerabilities,
    Map<String, Long> severityCounts,
    List<VulnerabilityResponseDto> recentFindings
) {}
