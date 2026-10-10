package com.vulntrack.service;

import com.vulntrack.dto.AssetRequestDto;
import com.vulntrack.dto.AssetResponseDto;
import com.vulntrack.entity.Asset;
import com.vulntrack.entity.AssetType;
import com.vulntrack.entity.Environment;
import com.vulntrack.exception.BadRequestException;
import com.vulntrack.exception.ResourceNotFoundException;
import com.vulntrack.repository.AssetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @InjectMocks
    private AssetService assetService;

    private Asset sampleAsset;
    private AssetRequestDto sampleRequest;

    @BeforeEach
    void setUp() {
        sampleAsset = new Asset("Payment Gateway", AssetType.API, Environment.PRODUCTION, "Handles payments");
        sampleAsset.setId(1L);

        sampleRequest = new AssetRequestDto(
            "Payment Gateway",
            AssetType.API,
            Environment.PRODUCTION,
            "Handles payments"
        );
    }

    @Test
    @DisplayName("getAllAssets should return mapped DTOs")
    void getAllAssets_shouldReturnMappedDtos() {
        when(assetRepository.findAll()).thenReturn(List.of(sampleAsset));

        List<AssetResponseDto> result = assetService.getAllAssets();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Payment Gateway");
        assertThat(result.get(0).type()).isEqualTo(AssetType.API);
    }

    @Test
    @DisplayName("getAssetById should return DTO when found")
    void getAssetById_whenFound_shouldReturnDto() {
        when(assetRepository.findById(1L)).thenReturn(Optional.of(sampleAsset));

        AssetResponseDto result = assetService.getAssetById(1L);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.name()).isEqualTo("Payment Gateway");
    }

    @Test
    @DisplayName("getAssetById should throw ResourceNotFoundException when not found")
    void getAssetById_whenNotFound_shouldThrowException() {
        when(assetRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> assetService.getAssetById(999L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Asset not found with ID: 999");
    }

    @Test
    @DisplayName("createAsset should save and return DTO when name is unique")
    void createAsset_whenUnique_shouldSaveAndReturnDto() {
        when(assetRepository.existsByNameIgnoreCase("Payment Gateway")).thenReturn(false);
        when(assetRepository.save(any(Asset.class))).thenReturn(sampleAsset);

        AssetResponseDto result = assetService.createAsset(sampleRequest);

        assertThat(result.name()).isEqualTo("Payment Gateway");
        verify(assetRepository, times(1)).save(any(Asset.class));
    }

    @Test
    @DisplayName("createAsset should throw BadRequestException when name already exists")
    void createAsset_whenDuplicateName_shouldThrowBadRequestException() {
        when(assetRepository.existsByNameIgnoreCase("Payment Gateway")).thenReturn(true);

        assertThatThrownBy(() -> assetService.createAsset(sampleRequest))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("already exists");

        verify(assetRepository, never()).save(any(Asset.class));
    }

    @Test
    @DisplayName("deleteAsset should delete asset when found")
    void deleteAsset_whenFound_shouldDelete() {
        when(assetRepository.findById(1L)).thenReturn(Optional.of(sampleAsset));

        assetService.deleteAsset(1L);

        verify(assetRepository, times(1)).delete(sampleAsset);
    }
}
