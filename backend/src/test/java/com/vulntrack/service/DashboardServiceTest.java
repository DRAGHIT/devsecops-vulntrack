package com.vulntrack.service;

import com.vulntrack.dto.DashboardSummaryDto;
import com.vulntrack.entity.Severity;
import com.vulntrack.entity.VulnerabilityStatus;
import com.vulntrack.repository.AssetRepository;
import com.vulntrack.repository.VulnerabilityRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private VulnerabilityRepository vulnerabilityRepository;

    @Mock
    private VulnerabilityService vulnerabilityService;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    @DisplayName("getDashboardSummary should correctly calculate KPIs")
    void getDashboardSummary_shouldCalculateKpis() {
        when(assetRepository.count()).thenReturn(5L);
        when(vulnerabilityRepository.countByStatus(VulnerabilityStatus.OPEN)).thenReturn(4L);
        when(vulnerabilityRepository.countByStatus(VulnerabilityStatus.FIXED)).thenReturn(2L);
        when(vulnerabilityRepository.countBySeverity(Severity.CRITICAL)).thenReturn(2L);
        when(vulnerabilityRepository.findTop5ByOrderByCreatedAtDesc()).thenReturn(Collections.emptyList());

        DashboardSummaryDto summary = dashboardService.getDashboardSummary();

        assertThat(summary.totalAssets()).isEqualTo(5L);
        assertThat(summary.openVulnerabilities()).isEqualTo(4L);
        assertThat(summary.fixedVulnerabilities()).isEqualTo(2L);
        assertThat(summary.criticalVulnerabilities()).isEqualTo(2L);
        assertThat(summary.severityCounts()).containsKey("CRITICAL");
    }
}
