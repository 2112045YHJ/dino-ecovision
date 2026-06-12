package com.ecovision.app.domain.mission.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecovision.app.domain.mission.dto.MissionDto;
import com.ecovision.app.domain.mission.service.MissionService;
import com.ecovision.app.global.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

//	mission API: 오늘의 미션 조회 / 미션 완료 (모두 인증 필요)
@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
public class MissionController {

	private final MissionService missionService;

	@GetMapping("/today")
	public ApiResponse<List<MissionDto.TodayMission>> today(@AuthenticationPrincipal Long userId) {
		return ApiResponse.success(missionService.getTodayMissions(userId));
	}

	@PostMapping("/{assignmentId}/complete")
	public ApiResponse<MissionDto.CompleteResponse> complete(
			@AuthenticationPrincipal Long userId,
			@PathVariable("assignmentId") Long assignmentId,
			@Valid @RequestBody MissionDto.CompleteRequest request) {
		return ApiResponse.success(missionService.complete(userId, assignmentId, request));
	}
}
