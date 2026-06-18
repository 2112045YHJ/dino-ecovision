package com.ecovision.app.domain.dino.repository;

import java.math.BigDecimal;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.ecovision.app.domain.dino.entity.UserDinoCollection;

//	도감(SB-13)의 totalCarbonKg 산출 전용 집계 리포지토리.
//	user_mission_results 를 읽기만 하며 mission 도메인 엔티티/리포지토리에 의존하지 않는다.
//	(1인 1마리 구조이므로 "해당 공룡으로 기여한 누적 탄소량" = 해당 사용자의 전체 미션 누적 절감량)
//
//	타입 파라미터로 UserDinoCollection 을 쓰지만 실제 매핑 대상이 아니라
//	Spring Data 가 Repository 빈을 만들기 위한 더미일 뿐이며, 정의된 쿼리는 전부 네이티브다.
public interface DinoCarbonStatRepository extends Repository<UserDinoCollection, Long> {

	//	사용자 누적 예상 탄소 절감량(kg). 완료 기록이 없으면 0.
	//	COALESCE 로 NULL 방지. estimated_reduction_kg 는 DECIMAL(12,3).
	@Query(value = """
			SELECT COALESCE(SUM(umr.estimated_reduction_kg), 0)
			FROM user_mission_results umr
			WHERE umr.user_id = :userId
			""", nativeQuery = true)
	BigDecimal sumEstimatedReductionKgByUserId(@Param("userId") Long userId);
}