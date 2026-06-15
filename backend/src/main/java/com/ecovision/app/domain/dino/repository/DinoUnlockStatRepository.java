package com.ecovision.app.domain.dino.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.ecovision.app.domain.dino.entity.UserDinoCollection;

//	도감 자동 해금 판정용 카운트 집계 전용 리포지토리.
//	mission/community 도메인 엔티티에 의존하지 않도록 전부 네이티브 쿼리로 작성한다
//	(DB설계서 10.8: 복잡 집계는 Native 허용).
//	타입 파라미터의 UserDinoCollection 은 Spring Data 가 Repository 빈을 만들기 위한 더미이며
//	실제 매핑 대상이 아니다(정의된 쿼리는 전부 네이티브).
public interface DinoUnlockStatRepository extends Repository<UserDinoCollection, Long> {

	//	자원순환(missions.category='WASTE') 미션의 완료 누적 횟수(반복 포함).
	//	user_mission_results(status='COMPLETED') 를 missions 와 조인해 카테고리로 필터.
	//	→ 브라키오 해금 조건(10회) 판정에 사용.
	@Query(value = """
			SELECT COUNT(*)
			FROM user_mission_results umr
			JOIN missions m ON m.id = umr.mission_id
			WHERE umr.user_id = :userId
			  AND umr.status = 'COMPLETED'
			  AND m.category = :category
			""", nativeQuery = true)
	long countWasteMissionCompletions(@Param("userId") Long userId, @Param("category") String category);

	//	사용자가 생성한 차트 공유 스냅샷 누적 개수.
	//	→ 트리케라 해금 조건(5회) 판정에 사용. (명세 3.3: "에너지 대시보드 스냅샷 5회 생성 시 해제")
	@Query(value = """
			SELECT COUNT(*)
			FROM chart_snapshots cs
			WHERE cs.user_id = :userId
			""", nativeQuery = true)
	long countChartSnapshots(@Param("userId") Long userId);
}
