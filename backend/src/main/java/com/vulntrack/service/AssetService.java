package com.vulntrack.service;

import com.vulntrack.dto.AssetRequestDto;
import com.vulntrack.dto.AssetResponseDto;
import com.vulntrack.entity.Asset;
import com.vulntrack.exception.BadRequestException;
import com.vulntrack.exception.ResourceNotFoundException;
import com.vulntrack.repository.AssetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AssetService {

    private final AssetRepository assetRepository;

    public AssetService(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @Transactional(readOnly = true)
    public List<AssetResponseDto> getAllAssets() {
        return assetRepository.findAll()
            .stream()
            .map(this::mapToResponseDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public AssetResponseDto getAssetById(Long id) {
        Asset asset = findEntityById(id);
        return mapToResponseDto(asset);
    }

    public AssetResponseDto createAsset(AssetRequestDto request) {
        if (assetRepository.existsByNameIgnoreCase(request.name())) {
            throw new BadRequestException("An asset with the name '" + request.name() + "' already exists");
        }

        Asset asset = new Asset(
            request.name().trim(),
            request.type(),
            request.environment(),
            request.description() != null ? request.description().trim() : null
        );

        Asset saved = assetRepository.save(asset);
        return mapToResponseDto(saved);
    }

    public AssetResponseDto updateAsset(Long id, AssetRequestDto request) {
        Asset asset = findEntityById(id);

        if (!asset.getName().equalsIgnoreCase(request.name()) &&
            assetRepository.existsByNameIgnoreCase(request.name())) {
            throw new BadRequestException("An asset with the name '" + request.name() + "' already exists");
        }

        asset.setName(request.name().trim());
        asset.setType(request.type());
        asset.setEnvironment(request.environment());
        asset.setDescription(request.description() != null ? request.description().trim() : null);

        Asset updated = assetRepository.save(asset);
        return mapToResponseDto(updated);
    }

    public void deleteAsset(Long id) {
        Asset asset = findEntityById(id);
        assetRepository.delete(asset);
    }

    public Asset findEntityById(Long id) {
        return assetRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + id));
    }

    private AssetResponseDto mapToResponseDto(Asset asset) {
        long count = asset.getVulnerabilities() != null ? asset.getVulnerabilities().size() : 0;
        return new AssetResponseDto(
            asset.getId(),
            asset.getName(),
            asset.getType(),
            asset.getEnvironment(),
            asset.getDescription(),
            asset.getCreatedAt(),
            count
        );
    }
}
