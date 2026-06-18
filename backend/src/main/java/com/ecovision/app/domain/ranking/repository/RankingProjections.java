package com.ecovision.app.domain.ranking.repository;

import java.math.BigDecimal;

//	네이티브 쿼리 결과 매핑용 projection 인터페이스 모음.
public final class RankingProjections {

	private RankingProjections() {
	}

	//	개인 랭킹 목록 한 줄 (닉네임·지역명·점수). rank 는 서비스에서 부여.
	public interface PersonalRow {
		Long getUserId();
		String getNickname();
		String getRegionName();
		Integer getRankingPoint();
	}

	//	지역별 절감량 집계 한 줄.
	public interface RegionRow {
		String getRegionCode();
		String getRegionName();
		BigDecimal getSavedCarbonKg();
	}
}