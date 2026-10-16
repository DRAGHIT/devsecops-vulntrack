package com.vulntrack.controller;

import com.vulntrack.dto.AssetRequestDto;
import com.vulntrack.dto.AssetResponseDto;
import com.vulntrack.service.AssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@Tag(name = "Assets", description = "CRUD operations for the IT asset inventory")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping
    @Operation(summary = "List all assets", description = "Returns every asset in the inventory. Available to admin and viewer roles.")
    public ResponseEntity<List<AssetResponseDto>> getAllAssets() {
        return ResponseEntity.ok(assetService.getAllAssets());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get one asset by ID", description = "Returns a single asset or 404 RESOURCE_NOT_FOUND if the ID does not exist.")
    public ResponseEntity<AssetResponseDto> getAssetById(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getAssetById(id));
    }

    @PostMapping
    @Operation(summary = "Create an asset", description = "Adds a new asset to the inventory. Requires the admin role; invalid payloads return 400 VALIDATION_FAILED with per-field errors.")
    public ResponseEntity<AssetResponseDto> createAsset(@Valid @RequestBody AssetRequestDto request) {
        AssetResponseDto created = assetService.createAsset(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an asset", description = "Fully replaces the asset's fields. Requires the admin role.")
    public ResponseEntity<AssetResponseDto> updateAsset(@PathVariable Long id,
                                                        @Valid @RequestBody AssetRequestDto request) {
        AssetResponseDto updated = assetService.updateAsset(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an asset", description = "Removes the asset and cascades deletion to its vulnerability findings. Requires the admin role.")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
}
