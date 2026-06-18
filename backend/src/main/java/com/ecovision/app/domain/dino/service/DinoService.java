package com.ecovision.app.domain.dino.service;
 
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
 
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import com.ecovision.app.domain.dino.constant.DinoUnlockConditions;
import com.ecovision.app.domain.dino.dto.DinoCollectionDto;
import com.ecovision.app.domain.dino.dto.DinoDto;
import com.ecovision.app.domain.dino.entity.DinoTemplate;
import com.ecovision.app.domain.dino.entity.LevelPolicy;
import com.ecovision.app.domain.dino.entity.UserDino;
import com.ecovision.app.domain.dino.entity.UserDinoCollection;
import com.ecovision.app.domain.dino.repository.DinoCarbonStatRepository;
import com.ecovision.app.domain.dino.repository.DinoTemplateRepository;
import com.ecovision.app.domain.dino.repository.LevelPolicyRepository;
import com.ecovision.app.domain.dino.repository.UserDinoCollectionRepository;
import com.ecovision.app.domain.dino.repository.UserDinoRepository;
import com.ecovision.app.domain.mission.scheduler.MissionScheduler;
import com.ecovision.app.domain.mission.service.MissionAssignmentService;
import com.ecovision.app.global.exception.BusinessException;
import com.ecovision.app.global.exception.ErrorCode;
 
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

//	공룡 부화(온보딩 마지막 단계) 및 상태 조회.
@Service
@RequiredArgsConstructor
@Slf4j
public class DinoService {

	private final UserDinoRepository userDinoRepository;
	private final DinoTemplateRepository dinoTemplateRepository;
	private final UserDinoCollectionRepository collectionRepository;
	private final LevelPolicyRepository levelPolicyRepository;
	private final DinoCarbonStatRepository dinoCarbonStatRepository;
	private final MissionAssignmentService missionAssignmentService;

	// 부화: 1인 1마리 → 보유 시 DINO_ALREADY_EXISTS. 템플릿 검증 후 EGG 생성 + 도감 해금.
	@Transactional
	public DinoDto.HatchResponse hatch(Long userId, DinoDto.HatchRequest request) {
		if (userDinoRepository.existsByUserId(userId)) {
			throw new BusinessException(ErrorCode.DINO_ALREADY_EXISTS);
		}
		if (!dinoTemplateRepository.existsById(request.templateId())) {
			throw new BusinessException(ErrorCode.INVALID_TEMPLATE);
		}

		UserDino dino = userDinoRepository.save(
				UserDino.hatch(userId, request.templateId(), request.nickname()));

		if (!collectionRepository.existsByUserIdAndDinoTemplateId(userId, request.templateId())) {
			collectionRepository.save(UserDinoCollection.unlock(userId, request.templateId()));
		}

		// 온보딩 완료 → 당일 미션 즉시 배정 (best-effort: 실패해도 부화는 성공)
		try {
		    missionAssignmentService.assignForUser(userId, java.time.LocalDate.now());
		} catch (Exception e) {
		    log.warn("[HATCH] 미션 자동 배정 실패 (부화는 정상 완료). userId={}", userId, e);
		}

		return new DinoDto.HatchResponse(
				dino.getId(), dino.getNickname(), dino.getStage().name(), dino.getExp(), dino.getAffinity());
	}

	@Transactional(readOnly = true)
	public DinoDto.DinoStatusResponse getMyDino(Long userId) {
		UserDino dino = userDinoRepository.findByUserId(userId)
				.orElseThrow(() -> new BusinessException(ErrorCode.DINO_NOT_FOUND));
		DinoTemplate template = dinoTemplateRepository.findById(dino.getDinoTemplateId())
				.orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TEMPLATE));

		Integer nextStageExp = nextStageExp(dino.getStage().name());

		return new DinoDto.DinoStatusResponse(
				dino.getId(), dino.getNickname(), template.getDinoCode(), template.getDinoName(),
				dino.getStage().name(), dino.getExp(), nextStageExp, dino.getAffinity());
	}

	//	공룡 도감 조회 (SB-13 / FRDIN06). 전체 템플릿 3종을 해금 상태와 함께 반환.
	//	- 해금 종: firstHatchedAt = 해금 시각(unlocked_at), totalCarbonKg = 사용자 누적 예상 절감량
	//	- 미해금 종: unlockCondition 안내 문구, 나머지 null
	@Transactional(readOnly = true)
	public DinoCollectionDto.CollectionResponse getCollection(Long userId) {
		// 전체 종 템플릿 (templateId 오름차순 → 명세 예시·SB-13 카드 배치 순서와 일치)
		List<DinoTemplate> templates = dinoTemplateRepository.findAllByOrderByIdAsc();
 
		// 사용자가 해금한 종: templateId → 해금 시각
		Map<Long, LocalDateTime> unlockedAtByTemplate = collectionRepository.findAllByUserId(userId).stream()
				.collect(Collectors.toMap(
						UserDinoCollection::getDinoTemplateId,
						UserDinoCollection::getUnlockedAt,
						(a, b) -> a)); // 동일 종 중복 행 방어(정상적으론 uk 제약으로 1건)
 
		Set<Long> unlockedTemplateIds = unlockedAtByTemplate.keySet();
 
		// 누적 탄소 절감량: 해금 종이 하나라도 있을 때만 1회 집계 (1인 1마리 → 해금 종 공통값)
		BigDecimal userTotalCarbonKg = unlockedTemplateIds.isEmpty()
				? null
				: dinoCarbonStatRepository.sumEstimatedReductionKgByUserId(userId);
 
		List<DinoCollectionDto.CollectionItem> items = templates.stream()
				.map(t -> {
					if (unlockedTemplateIds.contains(t.getId())) {
						return DinoCollectionDto.CollectionItem.unlocked(
								t.getId(), t.getDinoName(),
								unlockedAtByTemplate.get(t.getId()), userTotalCarbonKg);
					}
					return DinoCollectionDto.CollectionItem.locked(
							t.getId(), t.getDinoName(), DinoUnlockConditions.of(t.getId()));
				})
				.toList();
 
		return new DinoCollectionDto.CollectionResponse(
				unlockedTemplateIds.size(), templates.size(), items);
	}
	// 현재 단계의 다음 단계 required_exp. 마지막(ADULT)이면 null.
	private Integer nextStageExp(String currentLevelCode) {
		List<LevelPolicy> policies = levelPolicyRepository.findAllByOrderBySortOrderAsc();
		for (int i = 0; i < policies.size(); i++) {
			if (policies.get(i).getLevelCode().equals(currentLevelCode)) {
				return (i + 1 < policies.size()) ? policies.get(i + 1).getRequiredExp() : null;
			}
		}
		return null;
	}
}
