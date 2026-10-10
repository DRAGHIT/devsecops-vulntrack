package com.vulntrack.service;

import com.vulntrack.dto.DashboardSummaryDto;
import com.vulntrack.dto.VulnerabilityResponseDto;
import com.vulntrack.entity.Severity;
import com.vulntrack.entity.VulnerabilityStatus;
import com.vulntrack.repository.AssetRepository;
import com.vulntrack.repository.VulnerabilityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final AssetRepository assetRepository;
    private final VulnerabilityRepository vulnerabilityRepository;
    private final VulnerabilityService vulnerabilityService;

    public DashboardService(AssetRepository assetRepository,
                            VulnerabilityRepository vulnerabilityRepository,
                            VulnerabilityService vulnerabilityService) {
        this.assetRepository = assetRepository;
        this.vulnerabilityRepository = vulnerabilityRepository;
        this.vulnerabilityService = vulnerabilityService;
    }

    public DashboardSummaryDto getDashboardSummary() {
        long totalAssets = assetRepository.count();
        long openFindings = vulnerabilityRepository.countByStatus(VulnerabilityStatus.OPEN);
        long fixedFindings = vulnerabilityRepository.countByStatus(VulnerabilityStatus.FIXED);
        long criticalFindings = vulnerabilityRepository.countBySeverity(Severity.CRITICAL);

        Map<String, Long> severityCounts = new HashMap<>();
        for (Severity severity : Severity.values()) {
            severityCounts.put(severity.name(), vulnerabilityRepository.countBySeverity(severity));
        }

        List<VulnerabilityResponseDto> recentFindings = vulnerabilityRepository.findTop5ByOrderByCreatedAtDesc()
            .stream()
            .map(vulnerabilityService::mapToResponseDto)
            .toList();

        return new DashboardSummaryDto(
            totalAssets,
            openFindings,
            criticalFindings,
            fixedFindings,
            severityCounts,
            recentFindings
        );
    }
}
