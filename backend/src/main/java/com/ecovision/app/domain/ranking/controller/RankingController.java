package com.ecovision.app.domain.ranking.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecovision.app.domain.ranking.dto.RankingDto;
import com.ecovision.app.domain.ranking.service.RankingService;
import com.ecovision.app.global.response.ApiResponse;

import lombok.RequiredArgsConstructor;

//	ranking API: 개인 랭킹(8.1) / 지역 맵(8.2) / 시즌 정보(8.3). 모두 인증 필요.
@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
public class RankingController {

	private final RankingService rankingService;

	//	8.1 개인 랭킹. scope=national|region (기본 national), page/size 페이징.
	@GetMapping("/personal")
	public ApiResponse<RankingDto.PersonalRankingResponse> getPersonalRanking(
			@AuthenticationPrincipal Long userId,
			@RequestParam(name = "scope", defaultValue = "national") String scope,
			@RequestParam(name = "page", defaultValue = "0") int page,
			@RequestParam(name = "size", defaultValue = "20") int size) {
		return ApiResponse.success(rankingService.getPersonalRanking(userId, scope, page, size));
	}

	//	8.2 지역 맵. scope=national|sido (기본 national).
	@GetMapping("/region-map")
	public ApiResponse<RankingDto.RegionMapResponse> getRegionMap(
			@RequestParam(name = "scope", defaultValue = "national") String scope) {
		return ApiResponse.success(rankingService.getRegionMap(scope));
	}

	//	8.3 현재 시즌 정보.
	@GetMapping("/season")
	public ApiResponse<RankingDto.SeasonInfoResponse> getSeasonInfo() {
		return ApiResponse.success(rankingService.getSeasonInfo());
	}
}