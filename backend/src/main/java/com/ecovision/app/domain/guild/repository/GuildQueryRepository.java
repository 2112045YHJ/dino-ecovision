package com.ecovision.app.domain.guild.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.ecovision.app.domain.guild.entity.Guild;

// 길드 조회 전용 집계 리포지토리(네이티브). 기존 GuildRepository/GuildMemberRepository 와 분리.
// 타입 파라미터 Guild 는 Repository 빈 생성용 더미.
public interface GuildQueryRepository extends Repository<Guild, Long>{
	

	// ===== 7.1 내 길드 =====
 
	//	길드 시즌 점수(guild_ranking_scores). 없으면 null → 0 처리.
	@Query(value = """
			SELECT grs.ranking_point
			FROM guild_ranking_scores grs
			WHERE grs.guild_id = :guildId AND grs.season_id = :seasonId
			""", nativeQuery = true)
	Integer findGuildSeasonScore(@Param("guildId") Long guildId, @Param("seasonId") Long seasonId);
 
	//	길드 전국 순위 계산용: 내 길드보다 시즌 점수가 높은 길드 수. 경쟁 순위 = 이 값 + 1.
	@Query(value = """
			SELECT COUNT(*)
			FROM guild_ranking_scores grs
			WHERE grs.season_id = :seasonId AND grs.ranking_point > :myScore
			""", nativeQuery = true)
	long countGuildsAbove(@Param("seasonId") Long seasonId, @Param("myScore") int myScore);
 
	//	현재 활성 멤버 수(leftAt IS NULL).
	@Query(value = """
			SELECT COUNT(*)
			FROM guild_members gm
			WHERE gm.guild_id = :guildId AND gm.left_at IS NULL
			""", nativeQuery = true)
	long countActiveMembers(@Param("guildId") Long guildId);
 
	//	내 시즌 기여 점수(user_ranking_scores). 없으면 null → 0 처리.
	@Query(value = """
			SELECT urs.ranking_point
			FROM user_ranking_scores urs
			WHERE urs.user_id = :userId AND urs.season_id = :seasonId
			""", nativeQuery = true)
	Integer findMyContribution(@Param("userId") Long userId, @Param("seasonId") Long seasonId);
 
	//	길드 내 기여 순위 계산용: 같은 길드의 활성 멤버 중 나보다 시즌 점수 높은 인원 수.
	//	guild_members(활성) ⋈ user_ranking_scores 로 같은 길드원 점수를 비교.
	@Query(value = """
			SELECT COUNT(*)
			FROM guild_members gm
			JOIN user_ranking_scores urs ON urs.user_id = gm.user_id
			WHERE gm.guild_id = :guildId
			  AND gm.left_at IS NULL
			  AND urs.season_id = :seasonId
			  AND urs.ranking_point > :myScore
			""", nativeQuery = true)
	long countMembersAboveInGuild(@Param("guildId") Long guildId,
			@Param("seasonId") Long seasonId, @Param("myScore") int myScore);
 
	// ===== 7.2 멤버 목록 =====
 
	//	길드 활성 멤버 목록. 기여 점수(user_ranking_scores) 내림차순. 점수 없으면 0 취급해 뒤로.
	//	정상 계정만. role 은 guild_members.role 그대로.
	@Query(value = """
			SELECT gm.user_id AS userId,
			       u.nickname AS nickname,
			       gm.role AS role,
			       COALESCE(urs.ranking_point, 0) AS seasonContribution
			FROM guild_members gm
			JOIN users u ON u.id = gm.user_id
			LEFT JOIN user_ranking_scores urs
			       ON urs.user_id = gm.user_id AND urs.season_id = :seasonId
			WHERE gm.guild_id = :guildId
			  AND gm.left_at IS NULL
			  AND u.status = 'ACTIVE'
			ORDER BY seasonContribution DESC, gm.user_id ASC
			""", nativeQuery = true)
	List<GuildProjections.MemberRow> findGuildMembers(
			@Param("guildId") Long guildId, @Param("seasonId") Long seasonId);
 
	// ===== 7.3 전국 랭킹 =====
 
	//	길드 전국 랭킹 목록(시즌 점수 내림차순, 페이징). guild_ranking_scores ⋈ guilds ⋈ regions.
	//	삭제되지 않은 길드(deleted_at IS NULL)만.
	@Query(value = """
			SELECT g.id AS guildId,
			       g.guild_name AS name,
			       CONCAT_WS(' ', r.sido, r.sigungu, r.dong) AS regionName,
			       grs.ranking_point AS seasonScore
			FROM guild_ranking_scores grs
			JOIN guilds g ON g.id = grs.guild_id
			LEFT JOIN regions r ON r.id = g.region_id
			WHERE grs.season_id = :seasonId
			  AND g.deleted_at IS NULL
			ORDER BY grs.ranking_point DESC, g.id ASC
			""", nativeQuery = true)
	List<GuildProjections.GuildRankRow> findGuildRanking(
			@Param("seasonId") Long seasonId, Pageable pageable);
}
