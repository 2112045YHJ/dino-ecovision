package com.ecovision.app.domain.guild.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecovision.app.domain.guild.dto.GuildDto;
import com.ecovision.app.domain.guild.service.GuildQueryService;
import com.ecovision.app.global.response.ApiResponse;

import lombok.RequiredArgsConstructor;

//	guild 조회 API: 내 길드(7.1) / 멤버 목록(7.2) / 전국 랭킹(7.3). 모두 인증 필요.
//	가입·탈퇴 API는 없음(지역 자동 배정).
@RestController
@RequestMapping("/api/guilds")
@RequiredArgsConstructor
public class GuildController {

	private final GuildQueryService guildQueryService;

	//	7.1 내 길드 조회
	@GetMapping("/me")
	public ApiResponse<GuildDto.MyGuildResponse> getMyGuild(@AuthenticationPrincipal Long userId) {
		return ApiResponse.success(guildQueryService.getMyGuild(userId));
	}

	//	7.2 길드 멤버 목록 (기여 점수 내림차순)
	@GetMapping("/me/members")
	public ApiResponse<List<GuildDto.MemberEntry>> getMyGuildMembers(@AuthenticationPrincipal Long userId) {
		return ApiResponse.success(guildQueryService.getMyGuildMembers(userId));
	}

	//	7.3 길드 전국 랭킹 (점수 내림차순, 페이징)
	@GetMapping("/ranking")
	public ApiResponse<List<GuildDto.GuildRankEntry>> getGuildRanking(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return ApiResponse.success(guildQueryService.getGuildRanking(page, size));
	}
}