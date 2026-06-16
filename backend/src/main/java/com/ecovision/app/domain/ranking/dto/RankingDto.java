package com.ecovision.app.domain.ranking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

//	ranking 도메인 응답 DTO. (8.1 개인 랭킹 / 8.2 지역 맵 / 8.3 시즌 정보)
public final class RankingDto {

	private RankingDto() {
	}

	// ===== 8.1 개인 랭킹 조회 =====

	//	scope: national / region. myRank 는 목록과 별개로 항상 함께 반환(SB19 하단 고정 바).
	public record PersonalRankingResponse(
			String scope,
			String seasonName,
			MyRank myRank,
			List<RankingEntry> rankings) {
	}

	//	내 순위 요약. 시즌 점수가 없으면(미참여) rank/percentile 은 null.
	@JsonInclude(JsonInclude.Include.ALWAYS)
	public record MyRank(
			Integer rank,
			int rankingPoint,
			Double percentile) {
	}

	//	순위 목록 항목.
	public record RankingEntry(
			int rank,
			String nickname,
			String regionName,
			int rankingPoint) {
	}

	// ===== 8.2 지역 맵 랭킹 =====

	public record RegionMapResponse(
			List<RegionAggregate> regions,
			List<TopRegion> topRegions) {
	}

	//	행정구역별 집계 + 히트맵 명도(intensity, 0~1 정규화).
	public record RegionAggregate(
			String regionCode,
			String regionName,
			BigDecimal savedCarbonKg,
			double intensity) {
	}

	//	우수 지역 순위.
	public record TopRegion(
			int rank,
			String regionName,
			BigDecimal savedCarbonKg) {
	}

	// ===== 8.3 현재 시즌 정보 =====

	public record SeasonInfoResponse(
			Long seasonId,
			String name,
			LocalDateTime startsAt,
			LocalDateTime endsAt,
			long remainingDays) {
	}
}