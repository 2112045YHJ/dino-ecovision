package com.ecovision.app.domain.dino.constant;

//	도감 자동 해금 정책값. 명세 3.3 / SB-13 기준(MVP).
//	- 브라키오(templateId=2): 자원순환(missions.category='WASTE') 미션 누적 완료 10회(반복 포함)
//	- 트리케라(templateId=3): 차트 공유 스냅샷(chart_snapshots) 누적 생성 5회
//	티라노(templateId=1)는 온보딩 부화로만 해금되며 자동 판정 대상이 아니다.
public final class DinoUnlockPolicy {

	private DinoUnlockPolicy() {
	}

	//	자원순환 미션 카테고리 값 (missions.category)
	public static final String WASTE_CATEGORY = "WASTE";

	//	브라키오: 자원순환 미션 누적 완료 임계 횟수
	public static final long BRACHIO_TEMPLATE_ID = 2L;
	public static final long RESOURCE_MISSION_THRESHOLD = 10L;

	//	트리케라: 차트 스냅샷 생성 누적 임계 횟수
	public static final long TRICERA_TEMPLATE_ID = 3L;
	public static final long SNAPSHOT_THRESHOLD = 5L;
}
