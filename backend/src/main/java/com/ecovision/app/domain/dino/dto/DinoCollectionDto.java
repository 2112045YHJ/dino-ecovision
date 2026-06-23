package com.ecovision.app.domain.dino.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

//	공룡 도감 조회(GET /api/me/dino/collection) 응답 DTO. SB-13 / FRDIN06.
//	보유·미보유 공룡 템플릿(MVP 3종)을 해금 상태와 함께 반환한다.
public final class DinoCollectionDto {

	private DinoCollectionDto() {
	}

	//	도감 전체 응답. unlockedCount/totalCount + 종별 항목 배열.
	public record CollectionResponse(
			int unlockedCount,
			int totalCount,
			List<CollectionItem> dinos) {
	}

	//	종별 도감 항목.
	//	미해금 시 firstHatchedAt/totalCarbonKg 는 null, unlockCondition 에 잠금 해제 조건 안내.
	//	해금 시 unlockCondition 은 null.
	@JsonInclude(JsonInclude.Include.ALWAYS) // null 필드도 응답에 그대로 노출 (해금 여부에 따라 null 의미가 있음)
	public record CollectionItem(
			Long templateId,
			String name,
			boolean unlocked,
			String unlockCondition,
			LocalDateTime firstHatchedAt,
			BigDecimal totalCarbonKg) {

		//	해금된 종: 조건 문구는 null, 부화일/누적 탄소량 포함.
		public static CollectionItem unlocked(
				Long templateId, String name, LocalDateTime firstHatchedAt, BigDecimal totalCarbonKg) {
			return new CollectionItem(templateId, name, true, null, firstHatchedAt, totalCarbonKg);
		}

		//	미해금 종: 조건 문구만, 부화일/누적 탄소량은 null.
		public static CollectionItem locked(Long templateId, String name, String unlockCondition) {
			return new CollectionItem(templateId, name, false, unlockCondition, null, null);
		}
	}
}