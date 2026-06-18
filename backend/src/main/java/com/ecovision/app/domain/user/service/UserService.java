package com.ecovision.app.domain.user.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecovision.app.domain.dino.repository.UserDinoRepository;
import com.ecovision.app.domain.guild.service.GuildService;
import com.ecovision.app.domain.user.dto.UserDto;
import com.ecovision.app.domain.user.dto.MypageCommentsResponse;
import com.ecovision.app.domain.region.entity.Region;
import com.ecovision.app.domain.user.entity.User;
import com.ecovision.app.domain.user.entity.PointHistory;
import com.ecovision.app.domain.community.entity.Comment;
import com.ecovision.app.domain.region.repository.RegionRepository;
import com.ecovision.app.domain.user.repository.UserRepository;
import com.ecovision.app.domain.user.repository.PointHistoryRepository;
import com.ecovision.app.domain.community.repository.CommentRepository;
import com.ecovision.app.global.exception.BusinessException;
import com.ecovision.app.global.exception.ErrorCode;
import com.ecovision.app.global.response.ErrorResponse;

import lombok.RequiredArgsConstructor;

// 프로필 조회 / 닉네임 중복확인 / 온보딩 / 닉네임·지역 변경 / 포인트·댓글 조회
@Service
@RequiredArgsConstructor
public class UserService {

	private static final int NICKNAME_COOLDOWN_DAYS = 30;
	private static final int REGION_COOLDOWN_DAYS = 90;

	private final UserRepository userRepository;
	private final RegionRepository regionRepository;
	private final UserDinoRepository userDinoRepository;
	private final GuildService guildService;
	private final PointHistoryRepository pointHistoryRepository;
	private final CommentRepository commentRepository;

	@Transactional(readOnly = true)
	public UserDto.ProfileResponse getMyProfile(Long userId) {
		User user = getUser(userId);
		Region region = (user.getRegionId() == null) ? null
				: regionRepository.findById(user.getRegionId()).orElse(null);
		return toProfile(user, region);
	}

	@Transactional(readOnly = true)
	public UserDto.NicknameCheckResponse checkNickname(Long userId, String nickname) {
		// 형식 검증은 컨트롤러(@Validated)에서 수행. 여기서는 사용 가능 여부만.
		// 자기 자신을 제외하고 중복 여부를 체크한다. (온보딩 도중 세션 이탈 후 재진입한 경우 본인 닉네임 사용 가능하게 함)
		return new UserDto.NicknameCheckResponse(!userRepository.existsByNicknameAndIdNot(nickname, userId));
	}

	// 온보딩: 닉네임·지역 등록 + 지역 길드 자동 배정.
	@Transactional
	public UserDto.ProfileResponse onboarding(Long userId, UserDto.OnboardingRequest request) {
		User user = getUser(userId);

		// 전체 온보딩 완료(닉네임, 지역, 공룡)된 사용자만 중복 차단
		// 닉네임, 지역만 있고 공룡이 없는 상태는 '공룡 선택 단계'이므로 1단계 재호출 허용
		boolean hasDino = userDinoRepository.existsByUserId(userId);
		if (!user.isOnboardingRequired(hasDino)) {
			throw new BusinessException(ErrorCode.ALREADY_ONBOARDED);
		}

		// 닉네임/지역은 이미 저장되어 있고, 공룡만 없는 상태
		// -> 409 에러를 내지 않고 기존 프로필을 반환, 프론트가 공룡 선택 화면으로 진행하게 함
		if (user.isOnboarded() && !hasDino) {
			Region region = regionRepository.findById(user.getRegionId())
					.orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REGION_CODE));

			return toProfile(user, region);
		}

		// 처음 닉네임/지역을 저장하는 경우 자기 자신이 이미 쓰는 닉네임은 중복으로 보지 않음(자기 제외)
		if (userRepository.existsByNicknameAndIdNot(request.nickname(), userId)) {
			throw new BusinessException(ErrorCode.DUPLICATE_NICKNAME);
		}
		
		Region region = regionRepository.findByRegionCode(request.regionCode())
				.orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REGION_CODE));

		user.completeOnboarding(request.nickname(), region.getId(), LocalDateTime.now());
		guildService.assignToRegion(userId, region);

		return toProfile(user, region);
	}

	@Transactional
	public UserDto.ProfileResponse changeNickname(Long userId, UserDto.NicknameChangeRequest request) {
		User user = getUser(userId);
		if (request.nickname().equals(user.getNickname())) {
			Region region = (user.getRegionId() == null) ? null
					: regionRepository.findById(user.getRegionId()).orElse(null);
			return toProfile(user, region);
		}
		checkCooldown(user.getLastNicknameChangedAt(), NICKNAME_COOLDOWN_DAYS, "nickname",
				"닉네임은 " + NICKNAME_COOLDOWN_DAYS + "일에 1회만 변경할 수 있습니다.");
		if (userRepository.existsByNickname(request.nickname())) {
			throw new BusinessException(ErrorCode.DUPLICATE_NICKNAME);
		}
		user.changeNickname(request.nickname(), LocalDateTime.now());

		Region region = (user.getRegionId() == null) ? null
				: regionRepository.findById(user.getRegionId()).orElse(null);
		return toProfile(user, region);
	}

	@Transactional
	public UserDto.ProfileResponse changeRegion(Long userId, UserDto.RegionChangeRequest request) {
		User user = getUser(userId);
		Region region = regionRepository.findByRegionCode(request.regionCode())
				.orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REGION_CODE));

		if (region.getId().equals(user.getRegionId())) {
			return toProfile(user, region);
		}

		checkCooldown(user.getLastRegionChangedAt(), REGION_COOLDOWN_DAYS, "region",
				"지역은 " + REGION_COOLDOWN_DAYS + "일에 1회만 변경할 수 있습니다.");

		user.changeRegion(region.getId(), LocalDateTime.now());
		guildService.assignToRegion(userId, region); // 길드 재매핑

		return toProfile(user, region);
	}

	@Transactional(readOnly = true)
	public List<UserDto.PointHistoryResponse> getPointTimeline(Long userId) {
		if (!userRepository.existsById(userId)) {
			throw new BusinessException(ErrorCode.NOT_FOUND, "사용자를 찾을 수 없습니다.");
		}

		List<PointHistory> histories = pointHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
		return histories.stream()
				.map(h -> new UserDto.PointHistoryResponse(
						h.getId(),
						h.getReason(),
						h.getPointAmount(),
						h.getCreatedAt()
				))
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<MypageCommentsResponse> getMyComments(Long userId) {
		if (!userRepository.existsById(userId)) {
			throw new BusinessException(ErrorCode.NOT_FOUND, "사용자를 찾을 수 없습니다.");
		}
		List<Comment> comments = commentRepository.findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId);
		return comments.stream()
				.map(c -> MypageCommentsResponse.builder()
						.content(c.getContent())
						.postId(c.getPost().getId())
						.postTitle(c.getPost().getTitle())
						.createdAt(c.getCreatedAt())
						.build())
				.collect(Collectors.toList());
	}

// ===== 내부 헬퍼 =====

	private User getUser(Long userId) {
		return userRepository.findById(userId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
	}

	private void checkCooldown(LocalDateTime lastChangedAt, int cooldownDays, String field, String message) {
		if (lastChangedAt == null) {
			return;
		}
		LocalDateTime nextAllowed = lastChangedAt.plusDays(cooldownDays);
		if (LocalDateTime.now().isBefore(nextAllowed)) {
			List<ErrorResponse.FieldError> details = List
					.of(new ErrorResponse.FieldError(field, "다음 변경 가능일: " + nextAllowed.toLocalDate()));
			throw new BusinessException(ErrorCode.CHANGE_COOLDOWN, details);
		}
	}

	@Transactional
	public UserDto.ProfileResponse changeAvatar(Long userId, UserDto.AvatarChangeRequest request) {
		User user = getUser(userId);
		user.setAvatarUrl(request.avatarUrl());
		Region region = (user.getRegionId() == null) ? null
				: regionRepository.findById(user.getRegionId()).orElse(null);
		return toProfile(user, region);
	}

	private UserDto.ProfileResponse toProfile(User user, Region region) {
		boolean hasDino = userDinoRepository.existsByUserId(user.getId());
		return new UserDto.ProfileResponse(user.getId(), user.getEmail(), user.getNickname(),
				region == null ? null : region.getRegionCode(), region == null ? null : region.displayName(),
				user.getTotalPoints(), user.getRankingPoint(), user.getSavedCarbonKg().doubleValue(),
				user.getRole().name(), user.isOnboardingRequired(hasDino), user.getAvatarUrl());
	}
}
