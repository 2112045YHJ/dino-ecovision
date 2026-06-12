package com.ecovision.app.domain.user.service;

import com.ecovision.app.domain.region.entity.Region;
import com.ecovision.app.domain.region.repository.RegionRepository;
import com.ecovision.app.domain.community.entity.Comment;
import com.ecovision.app.domain.community.repository.CommentRepository;
import com.ecovision.app.domain.user.dto.MypageCommentsResponse;
import com.ecovision.app.domain.user.dto.UserDto;
import com.ecovision.app.domain.user.entity.PointHistory;
import com.ecovision.app.domain.user.entity.User;
import com.ecovision.app.domain.user.repository.PointHistoryRepository;
import com.ecovision.app.domain.user.repository.UserRepository;
import com.ecovision.app.global.exception.BusinessException;
import com.ecovision.app.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RegionRepository regionRepository;
    private final PointHistoryRepository pointHistoryRepository;
    private final CommentRepository commentRepository;

    @Transactional(readOnly = true)
    public UserDto.ProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        return convertToProfileResponse(user);
    }

    @Transactional(readOnly = true)
    public UserDto.NicknameCheckResponse checkNicknameAvailable(String nickname) {
        boolean exists = userRepository.existsByNickname(nickname);
        return new UserDto.NicknameCheckResponse(!exists);
    }

    @Transactional
    public UserDto.ProfileResponse completeOnboarding(Long userId, UserDto.OnboardingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        if (user.getNickname() == null || !user.getNickname().equals(request.nickname())) {
            if (userRepository.existsByNickname(request.nickname())) {
                throw new BusinessException(ErrorCode.VALIDATION_FAILED, "이미 사용 중인 닉네임입니다.");
            }
        }

        Region region = regionRepository.findByRegionCode(request.regionCode())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "존재하지 않는 지역 코드입니다."));

        user.completeOnboarding(request.nickname(), region.getId(), LocalDateTime.now());
        User saved = userRepository.save(user);

        return convertToProfileResponse(saved);
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

    private UserDto.ProfileResponse convertToProfileResponse(User user) {
        String regionCode = null;
        String regionName = null;

        if (user.getRegionId() != null) {
            Region region = regionRepository.findById(user.getRegionId()).orElse(null);
            if (region != null) {
                regionCode = region.getRegionCode();
                regionName = region.displayName();
            }
        }

        return new UserDto.ProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                regionCode,
                regionName,
                user.getTotalPoints(),
                user.getRankingPoint(),
                user.getSavedCarbonKg().doubleValue(),
                user.getRole().name(),
                user.isOnboardingRequired()
        );
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
}
