package com.ecovision.app.domain.ranking.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.ecovision.app.domain.ranking.entity.UserRankingScore;

//	랭킹 조회 전용 집계 리포지토리(네이티브). 캐시 테이블 user_ranking_scores 를 읽어
//	정렬·순위·percentile·지역집계를 산출한다. (SAD: 복잡 집계 네이티브/QueryDSL 병용)
//	타입 파라미터 UserRankingScore 는 빈 생성용 더미이며 매핑 대상이 아니다.
public interface RankingQueryRepository extends Repository<UserRankingScore, Long> {

	// ===== 8.1 개인 랭킹 — national =====

	//	전국 개인 랭킹 목록(점수 내림차순, 페이징). 닉네임/지역명 조인.
	//	정상 계정(status='ACTIVE')만 노출.
	@Query(value = """
			SELECT u.id AS userId, u.nickname AS nickname,
			       CONCAT_WS(' ', r.sido, r.sigungu, r.dong) AS regionName,
			       urs.ranking_point AS rankingPoint
			FROM user_ranking_scores urs
			JOIN users u ON u.id = urs.user_id
			LEFT JOIN regions r ON r.id = urs.region_id
			WHERE urs.season_id = :seasonId
			  AND u.status = 'ACTIVE'
			ORDER BY urs.ranking_point DESC, u.id ASC
			""", nativeQuery = true)
	List<RankingProjections.PersonalRow> findNationalRanking(
			@Param("seasonId") Long seasonId, Pageable pageable);

	// ===== 8.1 개인 랭킹 — region (우리 동네: 같은 region_id) =====

	@Query(value = """
			SELECT u.id AS userId, u.nickname AS nickname,
			       CONCAT_WS(' ', r.sido, r.sigungu, r.dong) AS regionName,
			       urs.ranking_point AS rankingPoint
			FROM user_ranking_scores urs
			JOIN users u ON u.id = urs.user_id
			LEFT JOIN regions r ON r.id = urs.region_id
			WHERE urs.season_id = :seasonId
			  AND urs.region_id = :regionId
			  AND u.status = 'ACTIVE'
			ORDER BY urs.ranking_point DESC, u.id ASC
			""", nativeQuery = true)
	List<RankingProjections.PersonalRow> findRegionRanking(
			@Param("seasonId") Long seasonId, @Param("regionId") Long regionId, Pageable pageable);

	// ===== myRank 계산용 =====

	//	내 시즌 점수. 없으면 null.
	@Query(value = """
			SELECT urs.ranking_point
			FROM user_ranking_scores urs
			WHERE urs.user_id = :userId AND urs.season_id = :seasonId
			""", nativeQuery = true)
	Integer findMyPoint(@Param("userId") Long userId, @Param("seasonId") Long seasonId);

	//	전국 기준: 나보다 점수가 높은(정상 계정) 인원 수. 경쟁 순위 = 이 값 + 1.
	@Query(value = """
			SELECT COUNT(*)
			FROM user_ranking_scores urs
			JOIN users u ON u.id = urs.user_id
			WHERE urs.season_id = :seasonId
			  AND u.status = 'ACTIVE'
			  AND urs.ranking_point > :myPoint
			""", nativeQuery = true)
	long countAboveNational(@Param("seasonId") Long seasonId, @Param("myPoint") int myPoint);

	//	지역 기준: 같은 동네에서 나보다 점수 높은 인원 수.
	@Query(value = """
			SELECT COUNT(*)
			FROM user_ranking_scores urs
			JOIN users u ON u.id = urs.user_id
			WHERE urs.season_id = :seasonId
			  AND urs.region_id = :regionId
			  AND u.status = 'ACTIVE'
			  AND urs.ranking_point > :myPoint
			""", nativeQuery = true)
	long countAboveRegion(@Param("seasonId") Long seasonId,
			@Param("regionId") Long regionId, @Param("myPoint") int myPoint);

	//	전국 전체 인원(정상 계정). percentile 분모.
	@Query(value = """
			SELECT COUNT(*)
			FROM user_ranking_scores urs
			JOIN users u ON u.id = urs.user_id
			WHERE urs.season_id = :seasonId AND u.status = 'ACTIVE'
			""", nativeQuery = true)
	long countTotalNational(@Param("seasonId") Long seasonId);

	//	지역 전체 인원(정상 계정).
	@Query(value = """
			SELECT COUNT(*)
			FROM user_ranking_scores urs
			JOIN users u ON u.id = urs.user_id
			WHERE urs.season_id = :seasonId AND urs.region_id = :regionId AND u.status = 'ACTIVE'
			""", nativeQuery = true)
	long countTotalRegion(@Param("seasonId") Long seasonId, @Param("regionId") Long regionId);

	// ===== 8.2 지역 맵 — 행정동 단위 집계 =====

	//	동네별 미션 절감량 합계(내림차순). 출처: user_ranking_scores.estimated_reduction_kg (정책 a).
	//	정상 계정만 합산. region_id 가 있는 행만.
	@Query(value = """
			SELECT r.region_code AS regionCode,
			       CONCAT_WS(' ', r.sido, r.sigungu, r.dong) AS regionName,
			       SUM(urs.estimated_reduction_kg) AS savedCarbonKg
			FROM user_ranking_scores urs
			JOIN users u ON u.id = urs.user_id
			JOIN regions r ON r.id = urs.region_id
			WHERE urs.season_id = :seasonId AND u.status = 'ACTIVE'
			GROUP BY r.id, r.region_code, r.sido, r.sigungu, r.dong
			ORDER BY savedCarbonKg DESC
			""", nativeQuery = true)
	List<RankingProjections.RegionRow> aggregateByDong(@Param("seasonId") Long seasonId);

	// ===== 8.2 지역 맵 — 시도 단위 집계 (scope=sido) =====

	//	시도별로 묶어 합계(내림차순). regionCode 는 시도 대표값이 없으므로 sido명을 키로 사용.
	@Query(value = """
			SELECT LEFT(r.region_code, 2) AS regionCode,
			       r.sido AS regionName,
			       SUM(urs.estimated_reduction_kg) AS savedCarbonKg
			FROM user_ranking_scores urs
			JOIN users u ON u.id = urs.user_id
			JOIN regions r ON r.id = urs.region_id
			WHERE urs.season_id = :seasonId AND u.status = 'ACTIVE'
			GROUP BY LEFT(r.region_code, 2), r.sido
			ORDER BY savedCarbonKg DESC
			""", nativeQuery = true)
	List<RankingProjections.RegionRow> aggregateBySido(@Param("seasonId") Long seasonId);
}