package com.ecovision.app.domain.region.controller;

import com.ecovision.app.domain.region.dto.RegionDto;
import com.ecovision.app.domain.region.service.RegionService;
import com.ecovision.app.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/regions")
@RequiredArgsConstructor
public class RegionController {

    private final RegionService regionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RegionDto.RegionResponse>>> getRegions() {
        List<RegionDto.RegionResponse> regions = regionService.getAllRegions();
        return ResponseEntity.ok(ApiResponse.success(regions));
    }
}
