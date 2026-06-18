package com.ecovision.app.domain.admin.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecovision.app.domain.admin.dto.AdminDto;
import com.ecovision.app.domain.dungeon.dto.DungeonDto;
import com.ecovision.app.domain.dungeon.entity.DungeonEvent;
import com.ecovision.app.domain.dungeon.repository.DungeonEventRepository;
import com.ecovision.app.domain.dungeon.repository.DungeonMissionAssignmentRepository;
import com.ecovision.app.domain.dungeon.service.DungeonMissionIssueService;
import com.ecovision.app.domain.dungeon.service.DungeonQueryService;
import com.ecovision.app.domain.user.entity.User;
import com.ecovision.app.domain.user.entity.UserStatus;
import com.ecovision.app.domain.user.repository.UserRepository;
import com.ecovision.app.global.exception.BusinessException;
import com.ecovision.app.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

//	관리자 운영 기능: 던전 수동 발령(13.2) / 회원 상태 변경(13.3).
//	발령은 dungeon 도메인의 배정·조회 서비스를 재사용해 자동 발령과 동일한 결과를 만든다.
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

	private static final int DEFAULT_DURATION_MIN = 60;
	private static final BigDecimal DUNGEON_MULTIPLIER = new BigDecimal("2.00");

	private final DungeonEventRepository dungeonEventRepository;
	private final DungeonMissionAssignmentRepository dungeonMissionAssignmentRepository;
	private final DungeonMissionIssueService dungeonMissionIssueService;
	private final DungeonQueryService dungeonQueryService;
	private final UserRepository userRepository;

	// ===== 13.2 던전 수동 발령 =====

	//	가짜 예비율로 던전을 강제 발령하고, 자동 발령과 동일하게 미션을 배정한 뒤 6.1 구조로 반환.
	//	요청자(관리자)의 userId 로 본인 배정 미션을 포함한 응답을 만든다.
	@Transactional
	public DungeonDto.ActiveDungeonResponse triggerManualDungeon(Long adminUserId, AdminDto.ManualDungeonRequest request) {
		int duration = (request.durationMinutes() != null && request.durationMinutes() > 0)
				? request.durationMinutes()
				: DEFAULT_DURATION_MIN;
		LocalDateTime now = LocalDateTime.now();
		BigDecimal reserveRate = request.reserveRate() != null ? BigDecimal.valueOf(request.reserveRate()) : null;

		// 기존 활성 던전이 있으면 강제 종료(단일 활성 불변식 유지).
		// 자동 종료(DungeonScheduler.checkAndEndDungeon)와 동일하게 ENDED 처리 + 미완료 배정 EXPIRED 정리.
		dungeonEventRepository.findFirstByStatusOrderByStartedAtDesc("ACTIVE")
				.ifPresent(active -> {
					active.setStatus("ENDED");
					active.setEndedAt(now);
					dungeonEventRepository.save(active);
					int expired = dungeonMissionAssignmentRepository
							.updateStatusByDungeonEventIdAndStatus(active.getId(), "ASSIGNED", "EXPIRED");
					log.info("[ADMIN] 기존 활성 던전 강제 종료. dungeonId={}, 만료배정={}", active.getId(), expired);
				});

		DungeonEvent dungeon = DungeonEvent.builder()
				.title("관리자 수동 발령 던전")
				.triggerType("MANUAL")
				.reserveRate(reserveRate)
				.rewardMultiplier(DUNGEON_MULTIPLIER)
				.status("ACTIVE")
				.startedAt(now)
				.endedAt(now.plusMinutes(duration))
				.build();
		dungeon = dungeonEventRepository.save(dungeon);

		// 자동 발령과 동일한 배정 로직 재사용 (대상: ACTIVE + 공룡 보유, 결정론적 2개)
		int issued = dungeonMissionIssueService.issueForDungeon(dungeon.getId());
		log.info("[ADMIN] 수동 던전 발령. dungeonId={}, 배정행={}, by admin={}", dungeon.getId(), issued, adminUserId);

		// 응답은 6.1과 동일 구조 (요청자 본인 배정 미션 포함)
		return dungeonQueryService.getActiveDungeon(adminUserId);
	}

	// ===== 13.3 회원 상태 변경 =====

	@Transactional
	public AdminDto.UserStatusResponse changeUserStatus(Long targetUserId, AdminDto.UserStatusRequest request) {
		// 허용 상태값 검증: enum 파싱 실패 시 INVALID_STATUS
		UserStatus newStatus;
		try {
			newStatus = UserStatus.valueOf(request.status() == null ? "" : request.status().trim().toUpperCase());
		} catch (IllegalArgumentException e) {
			throw new BusinessException(ErrorCode.INVALID_STATUS);
		}

		User user = userRepository.findById(targetUserId)
				.orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

		user.changeStatus(newStatus);
		log.info("[ADMIN] 회원 상태 변경. userId={}, status={}, reason={}",
				targetUserId, newStatus, request.reason());

		return new AdminDto.UserStatusResponse(targetUserId, newStatus.name());
	}
}