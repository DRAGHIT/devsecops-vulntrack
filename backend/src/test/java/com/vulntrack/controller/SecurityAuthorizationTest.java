package com.vulntrack.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vulntrack.dto.AssetRequestDto;
import com.vulntrack.dto.AssetResponseDto;
import com.vulntrack.dto.VulnerabilityStatusUpdateDto;
import com.vulntrack.entity.AssetType;
import com.vulntrack.entity.Environment;
import com.vulntrack.entity.VulnerabilityStatus;
import com.vulntrack.service.AssetService;
import com.vulntrack.service.DashboardService;
import com.vulntrack.service.VulnerabilityService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AssetService assetService;

    @MockBean
    private VulnerabilityService vulnerabilityService;

    @MockBean
    private DashboardService dashboardService;

    @Test
    @DisplayName("Unauthenticated request to GET /api/assets should return 401 Unauthorized")
    void unauthenticatedRequest_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/assets"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "viewer", roles = {"VIEWER"})
    @DisplayName("VIEWER role should be allowed to GET /api/assets (200 OK)")
    void viewerRole_canGetAssets() throws Exception {
        when(assetService.getAllAssets()).thenReturn(List.of(
            new AssetResponseDto(1L, "Web App", AssetType.WEB_APPLICATION, Environment.PRODUCTION, "Desc", Instant.now(), 0)
        ));

        mockMvc.perform(get("/api/assets"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Web App"));
    }

    @Test
    @WithMockUser(username = "viewer", roles = {"VIEWER"})
    @DisplayName("VIEWER role attempting POST /api/assets must be rejected with 403 Forbidden")
    void viewerRole_cannotCreateAsset_shouldReturn403Forbidden() throws Exception {
        AssetRequestDto request = new AssetRequestDto(
            "New Database",
            AssetType.DATABASE,
            Environment.STAGING,
            "Description"
        );

        mockMvc.perform(post("/api/assets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "viewer", roles = {"VIEWER"})
    @DisplayName("VIEWER role attempting DELETE /api/assets/{id} must be rejected with 403 Forbidden")
    void viewerRole_cannotDeleteAsset_shouldReturn403Forbidden() throws Exception {
        mockMvc.perform(delete("/api/assets/1"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "viewer", roles = {"VIEWER"})
    @DisplayName("VIEWER role attempting PATCH /api/vulnerabilities/{id}/status must be rejected with 403 Forbidden")
    void viewerRole_cannotUpdateVulnerabilityStatus_shouldReturn403Forbidden() throws Exception {
        VulnerabilityStatusUpdateDto request = new VulnerabilityStatusUpdateDto(VulnerabilityStatus.FIXED);

        mockMvc.perform(patch("/api/vulnerabilities/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("ADMIN role can successfully create an asset (201 Created)")
    void adminRole_canCreateAsset() throws Exception {
        AssetRequestDto request = new AssetRequestDto(
            "Production Redis Cache",
            AssetType.SERVER,
            Environment.PRODUCTION,
            "In-memory cache"
        );

        when(assetService.createAsset(any(AssetRequestDto.class))).thenReturn(
            new AssetResponseDto(5L, "Production Redis Cache", AssetType.SERVER, Environment.PRODUCTION, "In-memory cache", Instant.now(), 0)
        );

        mockMvc.perform(post("/api/assets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(5))
            .andExpect(jsonPath("$.name").value("Production Redis Cache"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("Request with invalid payload should return 400 Bad Request with validation details")
    void invalidPayload_shouldReturn400BadRequest() throws Exception {
        // Missing name and type
        String invalidPayload = """
            {
                "name": "",
                "description": "Missing required fields"
            }
            """;

        mockMvc.perform(post("/api/assets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidPayload))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.validationErrors.name").exists());
    }
}
