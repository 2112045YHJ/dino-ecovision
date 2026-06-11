package com.ecovision.app.domain.mission.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecovision.app.domain.dino.entity.DinoStage;
import com.ecovision.app.domain.dino.entity.LevelPolicy;
import com.ecovision.app.domain.dino.entity.UserDino;
import com.ecovision.app.domain.dino.repository.LevelPolicyRepository;
import com.ecovision.app.domain.dino.repository.UserDinoRepository;
import com.ecovision.app.domain.dungeon.entity.DungeonEvent;
import com.ecovision.app.domain.dungeon.entity.DungeonMissionAssignment;
import com.ecovision.app.domain.dungeon.repository.DungeonEventRepository;
import com.ecovision.app.domain.dungeon.repository.DungeonMissionAssignmentRepository;
import com.ecovision.app.domain.mission.dto.MissionDto;
import com.ecovision.app.domain.mission.entity.DailyMissionAssignment;
import com.ecovision.app.domain.mission.entity.Mission;
import com.ecovision.app.domain.mission.entity.UserMissionResult;
import com.ecovision.app.domain.mission.repository.DailyMissionAssignmentRepository;
import com.ecovision.app.domain.mission.repository.MissionEmissionFactorRepository;
import com.ecovision.app.domain.mission.repository.MissionRepository;
import com.ecovision.app.domain.mission.repository.UserMissionResultRepository;
import com.ecovision.app.domain.mypage.entity.PointHistory;
import com.ecovision.app.domain.mypage.repository.PointHistoryRepository;
import com.ecovision.app.domain.ranking.entity.RankingSeason;
import com.ecovision.app.domain.ranking.entity.UserRankingScore;
import com.ecovision.app.domain.ranking.repository.RankingSeasonRepository;
import com.ecovision.app.domain.ranking.repository.UserRankingScoreRepository;
import com.ecovision.app.domain.user.entity.User;
import com.ecovision.app.domain.user.repository.UserRepository;
import com.ecovision.app.domain.world.entity.CarbonIntensityLog;
import com.ecovision.app.domain.world.repository.CarbonIntensityLogRepository;
import com.ecovision.app.global.exception.BusinessException;
import com.ecovision.app.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

//	오늘의 미션 조회 + 미션 완료(보상·EXP·친밀도·진화·일일상한) 트랜잭션.
//	여러 도메인 레포를 포괄하여, 전체를 한 트랜잭션으로 묶는다(DB 9.3).
@Service
@RequiredArgsConstructor
public class MissionService {

	private static final int DAILY_POINT_LIMIT = 350;
	private static final int AFFINITY_PER_MISSION = 5;

	private final MissionRepository missionRepository;
	private final MissionEmissionFactorRepository emissionFactorRepository;
	private final DailyMissionAssignmentRepository dailyAssignmentRepository;
	private final DungeonMissionAssignmentRepository dungeonAssignmentRepository;
	private final DungeonEventRepository dungeonEventRepository;
	private final UserMissionResultRepository userMissionResultRepository;
	private final PointHistoryRepository pointHistoryRepository;
	private final CarbonIntensityLogRepository carbonIntensityLogRepository;
	private final RankingSeasonRepository rankingSeasonRepository;
	private final UserRankingScoreRepository userRankingScoreRepository;
	private final UserRepository userRepository;
	private final UserDinoRepository userDinoRepository;
	private final LevelPolicyRepository levelPolicyRepository;

	// 오늘 배정된 일일 미션 목록
	@Transactional(readOnly = true)
	public List<MissionDto.TodayMission> getTodayMissions(Long userId) {
		LocalDate today = LocalDate.now();
		List<DailyMissionAssignment> assignments = dailyAssignmentRepository.findByUserIdAndAssignedDate(userId, today);

		List<MissionDto.TodayMission> result = new ArrayList<>();
		for (DailyMissionAssignment a : assignments) {
			Mission mission = missionRepository.findById(a.getMissionId()).orElse(null);
			if (mission == null) {
				continue;
			}
			double co2 = emissionFactorRepository.findByMissionId(a.getMissionId())
					.map(f -> f.getDailyReductionValue() == null ? 0.0 : f.getDailyReductionValue().doubleValue())
					.orElse(0.0);
			result.add(new MissionDto.TodayMission(a.getId(), mission.getId(), mission.getMissionName(),
					mission.getCategory(), a.getSlotType(), mission.getBaseReward(), co2,
					"COMPLETED".equals(a.getStatus())));
		}
		return result;
	}

	// 미션 완료: 보상 계산 → 일일 상한 → 적립(결과/포인트/유저/랭킹/공룡) 을 한 트랜잭션으로.
	@Transactional
	public MissionDto.CompleteResponse complete(Long userId, Long assignmentId, MissionDto.CompleteRequest request) {
		String type = request.type();
		LocalDate today = LocalDate.now();

		User user = userRepository.findById(userId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

		// 1. 배정 조회·검증 + 타입별 분기
		Long missionId;
		BigDecimal dungeonMultiplier;
		String assignmentType;
		Long dailyAssignmentId = null;
		Long dungeonAssignmentId = null;
		DailyMissionAssignment daily = null;
		DungeonMissionAssignment dungeon = null;

		if ("DAILY".equals(type)) {
			daily = dailyAssignmentRepository.findById(assignmentId)
					.orElseThrow(() -> new BusinessException(ErrorCode.ASSIGNMENT_NOT_FOUND));
			if (!daily.getUserId().equals(userId)) {
				throw new BusinessException(ErrorCode.ASSIGNMENT_NOT_FOUND);
			}
			if ("COMPLETED".equals(daily.getStatus())) {
				throw new BusinessException(ErrorCode.ALREADY_COMPLETED);
			}
			if (!today.equals(daily.getAssignedDate())) {
				throw new BusinessException(ErrorCode.MISSION_EXPIRED); // 자정 경과
			}
			missionId = daily.getMissionId();
			dungeonMultiplier = BigDecimal.ONE;
			assignmentType = "DAILY";
			dailyAssignmentId = assignmentId;

		} else if ("DUNGEON".equals(type)) {
			dungeon = dungeonAssignmentRepository.findById(assignmentId)
					.orElseThrow(() -> new BusinessException(ErrorCode.ASSIGNMENT_NOT_FOUND));
			if (!dungeon.getUserId().equals(userId)) {
				throw new BusinessException(ErrorCode.ASSIGNMENT_NOT_FOUND);
			}
			if ("COMPLETED".equals(dungeon.getStatus())) {
				throw new BusinessException(ErrorCode.ALREADY_COMPLETED);
			}
			DungeonEvent event = dungeonEventRepository.findById(dungeon.getDungeonEventId()).orElse(null);
			if (event == null || !"ACTIVE".equals(event.getStatus())) {
				throw new BusinessException(ErrorCode.MISSION_EXPIRED); // 던전 종료
			}
			dungeonMultiplier = event.getRewardMultiplier() != null ? event.getRewardMultiplier()
					: new BigDecimal("2.00");
			missionId = dungeon.getMissionId();
			assignmentType = "DUNGEON";
			dungeonAssignmentId = assignmentId;

		} else {
			throw new BusinessException(ErrorCode.VALIDATION_FAILED, "type은 DAILY 또는 DUNGEON이어야 합니다.");
		}

		// 2. 미션·감축계수·탄소가중치
		Mission mission = missionRepository.findById(missionId)
				.orElseThrow(() -> new BusinessException(ErrorCode.ASSIGNMENT_NOT_FOUND));
		int baseReward = mission.getBaseReward();

		BigDecimal reductionKg = emissionFactorRepository.findByMissionId(missionId)
				.map(f -> f.getDailyReductionValue() == null ? BigDecimal.ZERO : f.getDailyReductionValue())
				.orElse(BigDecimal.ZERO);

		CarbonIntensityLog carbonLog = carbonIntensityLogRepository.findFirstByOrderByMeasuredAtDesc().orElse(null);
		BigDecimal carbonWeight = (carbonLog != null) ? carbonLog.getCarbonWeight() : BigDecimal.ONE;
		Long carbonLogId = (carbonLog != null) ? carbonLog.getId() : null;

		// 3. 최종 보상 = base × carbonWeight × dungeonMultiplier (반올림)
		int finalReward = BigDecimal.valueOf(baseReward).multiply(carbonWeight).multiply(dungeonMultiplier)
				.setScale(0, RoundingMode.HALF_UP).intValue();

		// 4. 일일 상한(350) — 남은 한도만큼만 적립
		int todayAccumulated = user.effectiveTodayAccumulated(today);
		int remaining = Math.max(0, DAILY_POINT_LIMIT - todayAccumulated);
		int earned = Math.min(finalReward, remaining);
		boolean dailyLimitApplied = (earned != finalReward);
		int newDailyAccumulated = todayAccumulated + earned;
		boolean dailyLimitReached = newDailyAccumulated >= DAILY_POINT_LIMIT;

		// 5. 활성 시즌
		RankingSeason season = rankingSeasonRepository.findFirstByIsActiveTrue()
				.orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR, "활성 랭킹 시즌이 없습니다."));

		// 6. user_mission_results 저장
		UserMissionResult result = UserMissionResult.builder().userId(userId).missionId(missionId)
				.assignmentType(assignmentType).dailyAssignmentId(dailyAssignmentId)
				.dungeonAssignmentId(dungeonAssignmentId).carbonIntensityLogId(carbonLogId).baseReward(baseReward)
				.carbonWeight(carbonWeight).dungeonMultiplier(dungeonMultiplier).calculatedReward(finalReward)
				.earnedPoint(earned).dailyLimitApplied(dailyLimitApplied).rankingPoint(earned).cleanEnergyAmount(earned)
				.estimatedReductionKg(reductionKg).proofType("SELF_REPORT").status("COMPLETED").build();
		result = userMissionResultRepository.save(result);

		// 7. point_history 1건
		pointHistoryRepository.save(PointHistory.missionComplete(userId, earned, result.getId()));

		// 8. users 갱신 (total/today/ranking/saved_carbon, 날짜 리셋 포함)
		user.applyMissionReward(earned, reductionKg, today);

		// 9. user_ranking_scores upsert (활성 시즌)
		UserRankingScore urs = userRankingScoreRepository.findByUserIdAndSeasonId(userId, season.getId())
				.orElseGet(() -> UserRankingScore.builder().userId(userId).seasonId(season.getId())
						.regionId(user.getRegionId()).rankingPoint(0).completedMissionCount(0)
						.estimatedReductionKg(BigDecimal.ZERO).build());
		urs.setRankingPoint(urs.getRankingPoint() + earned);
		urs.setCompletedMissionCount(urs.getCompletedMissionCount() + 1);
		urs.setEstimatedReductionKg(urs.getEstimatedReductionKg().add(reductionKg));
		if (urs.getRegionId() == null) {
			urs.setRegionId(user.getRegionId());
		}
		userRankingScoreRepository.save(urs);

		// 10. user_dinos: exp/친밀도/진화
		UserDino dino = userDinoRepository.findByUserId(userId)
				.orElseThrow(() -> new BusinessException(ErrorCode.DINO_NOT_FOUND));
		int newExp = dino.getExp() + earned;
		List<LevelPolicy> policies = levelPolicyRepository.findAllByOrderBySortOrderAsc();
		LevelPolicy targetStage = policies.get(0);
		for (LevelPolicy p : policies) {
			if (p.getRequiredExp() <= newExp) {
				targetStage = p;
			}
		}
		boolean evolved = targetStage.getSortOrder() > currentSortOrder(policies, dino.getStage().name());

		dino.addCleanEnergy(earned);
		int affinityGained = dino.increaseAffinity(AFFINITY_PER_MISSION);
		if (evolved) {
			dino.evolveTo(DinoStage.valueOf(targetStage.getLevelCode()), LocalDateTime.now());
		}

		// 11. 배정 상태 COMPLETED (dirty checking)
		if (daily != null) {
			daily.setStatus("COMPLETED");
		}
		if (dungeon != null) {
			dungeon.setStatus("COMPLETED");
		}

		// 응답
		return new MissionDto.CompleteResponse(assignmentId, baseReward, carbonWeight.doubleValue(),
				dungeonMultiplier.doubleValue(), finalReward, earned, dailyLimitReached, reductionKg.doubleValue(),
				newDailyAccumulated, DAILY_POINT_LIMIT,
				new MissionDto.DinoResult(earned, newExp, affinityGained, dino.getStage().name(), evolved));
	}

	private int currentSortOrder(List<LevelPolicy> policies, String levelCode) {
		for (LevelPolicy p : policies) {
			if (p.getLevelCode().equals(levelCode)) {
				return p.getSortOrder();
			}
		}
		return 1;
	}
}
