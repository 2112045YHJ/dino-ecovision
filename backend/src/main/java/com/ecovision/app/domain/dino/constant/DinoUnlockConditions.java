package com.ecovision.app.domain.dino.constant;

import java.util.Map;

//	공룡 도감 미해금 종의 잠금 해제 조건 안내 문구(SB-13 카드 힌트).
//	DB설계서 10.10: user_dino_collections 는 해금 여부 판단용으로만 사용하므로,
//	조건 문구는 DB 컬럼이 아닌 백엔드 상수로 관리한다(MVP). 2차 확장 시 dino_templates 컬럼 또는 정책 테이블로 이전.
//	키 = dino_templates.id (시드 고정 ID 기준).
public final class DinoUnlockConditions {

	private DinoUnlockConditions() {
	}

	//	MVP 기본 문구. 매핑에 없는 종이 미해금 상태일 때 사용.
	private static final String DEFAULT_CONDITION = "아직 잠금 해제 조건이 안내되지 않은 공룡입니다.";

	private static final Map<Long, String> CONDITIONS = Map.of(
			1L, "온보딩에서 알을 선택하면 해제됩니다.",
			2L, "자원순환 미션 10회 완료 시 해제",
			3L, "에너지 대시보드 스냅샷 5회 생성 시 해제");

	//	templateId 의 잠금 해제 조건 안내 문구. 매핑이 없으면 기본 문구.
	public static String of(Long templateId) {
		return CONDITIONS.getOrDefault(templateId, DEFAULT_CONDITION);
	}
}
