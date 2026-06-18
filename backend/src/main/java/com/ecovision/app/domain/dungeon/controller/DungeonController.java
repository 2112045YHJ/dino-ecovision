package com.ecovision.app.domain.dungeon.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecovision.app.domain.dungeon.dto.DungeonDto;
import com.ecovision.app.domain.dungeon.service.DungeonQueryService;
import com.ecovision.app.global.response.ApiResponse;

import lombok.RequiredArgsConstructor;

//	dungeon 조회 API: 활성 던전 조회(6.1).
//	발령·종료는 DungeonScheduler 자동, 수동 발령은 admin 도메인.
@RestController
@RequestMapping("/api/dungeons")
@RequiredArgsConstructor
public class DungeonController {

	private final DungeonQueryService dungeonQueryService;

	//	6.1 활성 던전 조회. 활성 던전 없으면 data=null.
	//	missions 는 요청자 본인에게 배정된 던전 미션. (인증 사용자 기준)
	@GetMapping("/active")
	public ApiResponse<DungeonDto.ActiveDungeonResponse> getActiveDungeon(
			@AuthenticationPrincipal Long userId) {
		return ApiResponse.success(dungeonQueryService.getActiveDungeon(userId));
	}
}