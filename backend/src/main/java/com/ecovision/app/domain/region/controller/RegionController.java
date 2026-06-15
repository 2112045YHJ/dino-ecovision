package com.ecovision.app.domain.region.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecovision.app.domain.region.dto.RegionDto;
import com.ecovision.app.domain.region.service.RegionService;
import com.ecovision.app.global.response.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/regions")
@RequiredArgsConstructor
public class RegionController {
	
	private final RegionService regionService;

	// 지역 목록 조회(인증 필요)
	@GetMapping
	public ApiResponse<List<RegionDto.RegionResponse>> getRegions() {
		return ApiResponse.success(regionService.getAllRegions());
	}
}
