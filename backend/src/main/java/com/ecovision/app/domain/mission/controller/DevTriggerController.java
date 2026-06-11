package com.ecovision.app.domain.mission.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecovision.app.domain.mission.scheduler.MissionScheduler;
import com.ecovision.app.global.response.ApiResponse;

import lombok.RequiredArgsConstructor;

//	[임시/개발용] 자정 배정 스케줄러를 즉시 실행해 오늘의 미션 배정을 생성한다.
//	로컬에서 자정을 기다리지 않고 완료 API를 테스트하기 위한 용도.
//	주의: 모든 활성 사용자에게 배정 + today_points_accumulated 리셋을 수행한다.
//	운영 배포 전 반드시 제거하거나 ADMIN 전용으로 보호할 것.
@RestController
@RequestMapping("/api/dev")
@RequiredArgsConstructor
public class DevTriggerController {

	private final MissionScheduler missionScheduler;

	@PostMapping("/assign-today")
	public ApiResponse<Void> assignToday() {
		missionScheduler.assignDailyMissions();
		return ApiResponse.successEmpty();
	}
}
