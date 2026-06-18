package com.ecovision.app.domain.guild.repository;

//	길드 조회 네이티브 쿼리 결과 매핑용 projection.
public final class GuildProjections {

	private GuildProjections() {
	}

	//	멤버 목록 한 줄. seasonContribution 은 user_ranking_scores 미참여 시 null → 서비스에서 0 처리.
	public interface MemberRow {
		Long getUserId();
		String getNickname();
		String getRole();
		Integer getSeasonContribution();
	}

	//	길드 랭킹 목록 한 줄. rank 는 서비스에서 부여.
	public interface GuildRankRow {
		Long getGuildId();
		String getName();
		String getRegionName();
		Integer getSeasonScore();
	}
}