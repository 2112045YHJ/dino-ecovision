package com.ecovision.app.domain.ranking.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecovision.app.domain.ranking.dto.RankingDto;
import com.ecovision.app.domain.ranking.entity.RankingSeason;
import com.ecovision.app.domain.ranking.repository.RankingProjections;
import com.ecovision.app.domain.ranking.repository.RankingQueryRepository;
import com.ecovision.app.domain.ranking.repository.RankingSeasonRepository;
import com.ecovision.app.domain.user.entity.User;
import com.ecovision.app.domain.user.repository.UserRepository;
import com.ecovision.app.global.exception.BusinessException;
import com.ecovision.app.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

//	개인 랭킹(8.1) / 지역 맵(8.2) / 시즌 정보(8.3) 조회.
//	데이터 출처는 스케줄러가 갱신하는 캐시 테이블 user_ranking_scores (미션 활동 기반).
@Service
@RequiredArgsConstructor
public class RankingService {

	private static final int TOP_REGION_LIMIT = 10; // 우수 지역 노출 개수

	private final RankingQueryRepository rankingQueryRepository;
	private final RankingSeasonRepository rankingSeasonRepository;
	private final UserRepository userRepository;

	// ===== 8.1 개인 랭킹 =====

	@Transactional(readOnly = true)
	public RankingDto.PersonalRankingResponse getPersonalRanking(
			Long userId, String scope, int page, int size) {

		RankingSeason season = activeSeason();
		Long seasonId = season.getId();
		boolean isRegion = "region".equalsIgnoreCase(scope);
		String normalizedScope = isRegion ? "region" : "national";

		// region scope면 사용자의 거주 지역이 필요
		Long regionId = null;
		if (isRegion) {
			User user = userRepository.findById(userId)
					.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
			regionId = user.getRegionId();
			if (regionId == null) {
				// 온보딩 전(지역 미등록): 빈 목록 + 점수만
				return emptyRegionResponse(normalizedScope, season.getSeasonName(), userId, seasonId);
			}
		}

		Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));

		// 목록 조회 + rank 부여(offset 기반 순번)
		List<RankingProjections.PersonalRow> rows = isRegion
				? rankingQueryRepository.findRegionRanking(seasonId, regionId, pageable)
				: rankingQueryRepository.findNationalRanking(seasonId, pageable);

		int baseRank = pageable.getPageNumber() * pageable.getPageSize();
		List<RankingDto.RankingEntry> rankings = new ArrayList<>(rows.size());
		for (int i = 0; i < rows.size(); i++) {
			RankingProjections.PersonalRow row = rows.get(i);
			rankings.add(new RankingDto.RankingEntry(
					baseRank + i + 1,
					row.getNickname(),
					row.getRegionName(),
					nullToZero(row.getRankingPoint())));
		}

		// myRank: 경쟁 순위(나보다 높은 수 + 1) + percentile(상위 N%)
		RankingDto.MyRank myRank = computeMyRank(seasonId, userId, regionId, isRegion);

		return new RankingDto.PersonalRankingResponse(
				normalizedScope, season.getSeasonName(), myRank, rankings);
	}

	//	myRank 계산. 미참여(점수 행 없음)면 rank/percentile = null, point = 0.
	private RankingDto.MyRank computeMyRank(Long seasonId, Long userId, Long regionId, boolean isRegion) {
		Integer myPointObj = rankingQueryRepository.findMyPoint(userId, seasonId);
		if (myPointObj == null) {
			return new RankingDto.MyRank(null, 0, null);
		}
		int myPoint = myPointObj;

		long above = isRegion
				? rankingQueryRepository.countAboveRegion(seasonId, regionId, myPoint)
				: rankingQueryRepository.countAboveNational(seasonId, myPoint);
		long total = isRegion
				? rankingQueryRepository.countTotalRegion(seasonId, regionId)
				: rankingQueryRepository.countTotalNational(seasonId);

		int rank = (int) (above + 1);
		// 상위 백분위 = (나보다 높은 사람 수 / 전체) × 100. 전체가 0이면 0%.
		double percentile = (total > 0)
				? round1((double) above / total * 100.0)
				: 0.0;

		return new RankingDto.MyRank(rank, myPoint, percentile);
	}

	private RankingDto.PersonalRankingResponse emptyRegionResponse(
			String scope, String seasonName, Long userId, Long seasonId) {
		Integer myPointObj = rankingQueryRepository.findMyPoint(userId, seasonId);
		int myPoint = nullToZero(myPointObj);
		RankingDto.MyRank myRank = (myPointObj == null)
				? new RankingDto.MyRank(null, 0, null)
				: new RankingDto.MyRank(null, myPoint, null);
		return new RankingDto.PersonalRankingResponse(scope, seasonName, myRank, List.of());
	}

	// ===== 8.2 지역 맵 =====

	@Transactional(readOnly = true)
	public RankingDto.RegionMapResponse getRegionMap(String scope) {
		RankingSeason season = activeSeason();
		Long seasonId = season.getId();
		boolean bySido = "sido".equalsIgnoreCase(scope);

		List<RankingProjections.RegionRow> rows = bySido
				? rankingQueryRepository.aggregateBySido(seasonId)
				: rankingQueryRepository.aggregateByDong(seasonId);

		// intensity 정규화 기준 = 집계 결과 내 최대 절감량
		BigDecimal max = BigDecimal.ZERO;
		for (RankingProjections.RegionRow row : rows) {
			BigDecimal v = nullToZero(row.getSavedCarbonKg());
			if (v.compareTo(max) > 0) {
				max = v;
			}
		}

		List<RankingDto.RegionAggregate> regions = new ArrayList<>(rows.size());
		List<RankingDto.TopRegion> topRegions = new ArrayList<>();
		int rank = 0;
		for (RankingProjections.RegionRow row : rows) {
			BigDecimal saved = nullToZero(row.getSavedCarbonKg());
			double intensity = (max.compareTo(BigDecimal.ZERO) > 0)
					? round2(saved.doubleValue() / max.doubleValue())
					: 0.0;
			regions.add(new RankingDto.RegionAggregate(
					row.getRegionCode(), row.getRegionName(), saved, intensity));

			if (rank < TOP_REGION_LIMIT) {
				topRegions.add(new RankingDto.TopRegion(rank + 1, row.getRegionName(), saved));
			}
			rank++;
		}

		return new RankingDto.RegionMapResponse(regions, topRegions);
	}

	// ===== 8.3 시즌 정보 =====

	@Transactional(readOnly = true)
	public RankingDto.SeasonInfoResponse getSeasonInfo() {
		RankingSeason season = activeSeason();
		// 종료까지 남은 일수(오늘 포함하지 않는 잔여일). 종료일이 지났으면 0.
		long remaining = ChronoUnit.DAYS.between(LocalDate.now(), season.getEndDate());
		if (remaining < 0) {
			remaining = 0;
		}
		return new RankingDto.SeasonInfoResponse(
				season.getId(),
				season.getSeasonName(),
				season.getStartDate().atStartOfDay(),
				season.getEndDate().atTime(LocalTime.MAX).withNano(0),
				remaining);
	}

	// ===== 공통 =====

	private RankingSeason activeSeason() {
		return rankingSeasonRepository.findFirstByIsActiveTrue()
				.orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR, "활성 랭킹 시즌이 없습니다."));
	}

	private static int nullToZero(Integer v) {
		return v == null ? 0 : v;
	}

	private static BigDecimal nullToZero(BigDecimal v) {
		return v == null ? BigDecimal.ZERO : v;
	}

	private static double round1(double v) {
		return BigDecimal.valueOf(v).setScale(1, RoundingMode.HALF_UP).doubleValue();
	}

	private static double round2(double v) {
		return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
	}
}