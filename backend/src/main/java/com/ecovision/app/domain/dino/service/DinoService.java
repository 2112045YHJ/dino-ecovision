package com.ecovision.app.domain.dino.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecovision.app.domain.dino.dto.DinoDto;
import com.ecovision.app.domain.dino.entity.DinoTemplate;
import com.ecovision.app.domain.dino.entity.LevelPolicy;
import com.ecovision.app.domain.dino.entity.UserDino;
import com.ecovision.app.domain.dino.entity.UserDinoCollection;
import com.ecovision.app.domain.dino.repository.DinoTemplateRepository;
import com.ecovision.app.domain.dino.repository.LevelPolicyRepository;
import com.ecovision.app.domain.dino.repository.UserDinoCollectionRepository;
import com.ecovision.app.domain.dino.repository.UserDinoRepository;
import com.ecovision.app.global.exception.BusinessException;
import com.ecovision.app.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

//	공룡 부화(온보딩 마지막 단계) 및 상태 조회.
@Service
@RequiredArgsConstructor
public class DinoService {

	private final UserDinoRepository userDinoRepository;
	private final DinoTemplateRepository dinoTemplateRepository;
	private final UserDinoCollectionRepository collectionRepository;
	private final LevelPolicyRepository levelPolicyRepository;

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
				dino.getId(), dino.getNickname(), template.getDinoName(),
				dino.getStage().name(), dino.getExp(), nextStageExp, dino.getAffinity());
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
