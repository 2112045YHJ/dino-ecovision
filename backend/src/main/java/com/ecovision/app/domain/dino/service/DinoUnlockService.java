package com.ecovision.app.domain.dino.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.ecovision.app.domain.dino.constant.DinoUnlockPolicy;
import com.ecovision.app.domain.dino.entity.UserDinoCollection;
import com.ecovision.app.domain.dino.repository.DinoUnlockStatRepository;
import com.ecovision.app.domain.dino.repository.UserDinoCollectionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

//	도감 자동 해금 판정 전담 서비스.
//	특정 행동(자원순환 미션 완료 / 차트 스냅샷 생성) 직후 호출되어, 임계 도달 시 해당 종을 해금한다.
//
//	설계 메모:
//	- 미해금 가드: 이미 해금된 종이면 카운트 쿼리조차 돌지 않는다(대부분의 호출에서 추가 비용 0, 해금 후 영구 소멸).
//	- 멱등: insert 직전 존재 재확인 + user_dino_collections.uk_user_template 유니크 제약이 최종 방어선.
//	- 트랜잭션: REQUIRES_NEW 로 독립 실행 → 해금 판정 실패가 본 작업(미션 완료/스냅샷 생성)을 롤백시키지 않는다.
//	  (MissionAssignmentService.assignForUser 와 동일한 컨벤션: REQUIRES_NEW + 호출부 best-effort try-catch)
//	- self-invocation 주의: 트랜잭션 경계 메서드는 반드시 '다른 빈'에서 호출해야 전파가 적용된다.
@Service
@RequiredArgsConstructor
@Slf4j
public class DinoUnlockService {

	private final DinoUnlockStatRepository unlockStatRepository;
	private final UserDinoCollectionRepository collectionRepository;

	//	자원순환 미션 완료 직후 호출. 누적 완료 10회 도달 시 브라키오 해금.
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void checkWasteMissionUnlock(Long userId) {
		if (isUnlocked(userId, DinoUnlockPolicy.BRACHIO_TEMPLATE_ID)) {
			return; // 이미 해금 → 카운트 생략
		}
		long count = unlockStatRepository.countWasteMissionCompletions(userId, DinoUnlockPolicy.WASTE_CATEGORY);
		if (count >= DinoUnlockPolicy.RESOURCE_MISSION_THRESHOLD) {
			unlock(userId, DinoUnlockPolicy.BRACHIO_TEMPLATE_ID, "자원순환 미션 누적 " + count + "회");
		}
	}

	//	차트 스냅샷 생성 직후 호출. 누적 생성 5회 도달 시 트리케라 해금.
	//	[연결 보류] 호출부(community 도메인의 스냅샷 생성 서비스)가 별도 브랜치 작업 중이라 아직 미연결.
	//	해당 브랜치 정리 후, 스냅샷 save 직후에 dinoUnlockService.checkSnapshotUnlock(userId) 한 줄을 best-effort(try-catch)로 추가하면 된다.
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void checkSnapshotUnlock(Long userId) {
		if (isUnlocked(userId, DinoUnlockPolicy.TRICERA_TEMPLATE_ID)) {
			return; // 이미 해금 → 카운트 생략
		}
		long count = unlockStatRepository.countChartSnapshots(userId);
		if (count >= DinoUnlockPolicy.SNAPSHOT_THRESHOLD) {
			unlock(userId, DinoUnlockPolicy.TRICERA_TEMPLATE_ID, "차트 스냅샷 누적 " + count + "회");
		}
	}

	private boolean isUnlocked(Long userId, long templateId) {
		return collectionRepository.existsByUserIdAndDinoTemplateId(userId, templateId);
	}

	//	해금 insert. 동시 호출 대비 존재 재확인 후 저장(최종 방어선은 uk_user_template 유니크 제약).
	private void unlock(Long userId, long templateId, String reason) {
		if (collectionRepository.existsByUserIdAndDinoTemplateId(userId, templateId)) {
			return;
		}
		collectionRepository.save(UserDinoCollection.unlock(userId, templateId));
		log.info("[DINO-UNLOCK] templateId={} 해금. userId={}, 사유={}", templateId, userId, reason);
	}
}