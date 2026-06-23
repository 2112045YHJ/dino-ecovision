package com.ecovision.app.domain.guild.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

//	guild 도메인 조회 응답 DTO. (7.1 내 길드 / 7.2 멤버 목록 / 7.3 전국 랭킹)
public final class GuildDto {

	private GuildDto() {
	}

	// ===== 7.1 내 길드 조회 =====

	@JsonInclude(JsonInclude.Include.ALWAYS)
	public record MyGuildResponse(
			Long guildId,
			String name,
			String regionCode,
			int seasonScore,
			int nationalRank,
			int memberCount,
			int capacity,
			int myContribution,
			Integer myContributionRank) { // 시즌 미참여 시 null
	}

	// ===== 7.2 길드 멤버 목록 =====

	public record MemberEntry(
			Long userId,
			String nickname,
			String role,
			int seasonContribution) {
	}

	// ===== 7.3 길드 전국 랭킹 =====

	public record GuildRankEntry(
			int rank,
			Long guildId,
			String name,
			String regionName,
			int seasonScore) {
	}
}