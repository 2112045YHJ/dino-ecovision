package com.ecovision.app.domain.quiz.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecovision.app.domain.dino.entity.DinoStage;
import com.ecovision.app.domain.dino.entity.LevelPolicy;
import com.ecovision.app.domain.dino.entity.UserDino;
import com.ecovision.app.domain.dino.repository.LevelPolicyRepository;
import com.ecovision.app.domain.dino.repository.UserDinoRepository;
import com.ecovision.app.domain.user.entity.PointHistory;
import com.ecovision.app.domain.user.repository.PointHistoryRepository;
import com.ecovision.app.domain.quiz.dto.QuizDto;
import com.ecovision.app.domain.quiz.entity.Quiz;
import com.ecovision.app.domain.quiz.entity.UserQuizAttempt;
import com.ecovision.app.domain.quiz.repository.QuizRepository;
import com.ecovision.app.domain.quiz.repository.UserQuizAttemptRepository;
import com.ecovision.app.domain.ranking.entity.RankingSeason;
import com.ecovision.app.domain.ranking.entity.UserRankingScore;
import com.ecovision.app.domain.ranking.repository.RankingSeasonRepository;
import com.ecovision.app.domain.ranking.repository.UserRankingScoreRepository;
import com.ecovision.app.domain.user.entity.User;
import com.ecovision.app.domain.user.repository.UserRepository;
import com.ecovision.app.global.exception.BusinessException;
import com.ecovision.app.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;

// 오늘의 퀴즈 조회 + 정답 제출(보상·EXP·랭킹) 트랜잭션
// 퀴즈 보상은 일일 350 상한과 별개이며 today_points_accumulated에 반영되지 않음
@Service
@RequiredArgsConstructor
public class QuizService {

	private final QuizRepository quizRepository;
	private final UserQuizAttemptRepository attemptRepository;
	private final PointHistoryRepository pointHistoryRepository;
	private final UserRepository userRepository;
	private final UserDinoRepository userDinoRepository;
	private final LevelPolicyRepository levelPolicyRepository;
	private final RankingSeasonRepository rankingSeasonRepository;
	private final UserRankingScoreRepository userRankingScoreRepository;

	@Transactional(readOnly = true)
	public QuizDto.TodayQuiz getTodayQuiz(Long userId) {
		LocalDate today = LocalDate.now();

		// 이미 풀었으면 그날 푼 퀴즈 + 결과를 반환
		UserQuizAttempt attempt = attemptRepository.findByUserIdAndAttemptedDate(userId, today).orElse(null);
		if (attempt != null) {
			Quiz quiz = quizRepository.findById(attempt.getQuizId())
					.orElseThrow(() -> new BusinessException(ErrorCode.QUIZ_NOT_FOUND));
			return toTodayQuiz(quiz, true, attempt.isCorrect());
		}

		// 미응시면 오늘의 퀴즈를 결정해 문제만 반환
		Quiz quiz = selectTodaysQuiz(today);
		return toTodayQuiz(quiz, false, null);
	}

	@Transactional
	public QuizDto.SubmitResponse submit(Long userId, Long quizId, QuizDto.SubmitRequest request) {
		LocalDate today = LocalDate.now();

		// 1. 하루 1회 제한
		if (attemptRepository.existsByUserIdAndAttemptedDate(userId, today)) {
			throw new BusinessException(ErrorCode.ALREADY_ATTEMPTED);
		}

		// 2. 퀴즈 조회
		Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new BusinessException(ErrorCode.QUIZ_NOT_FOUND));

		// 3. 선택지 유효성(존재하는 보기인지) + 정답 판별
		String selectedLetter = optionNoToLetter(request.optionNo());
		if (selectedLetter == null || optionText(quiz, selectedLetter) == null) {
			throw new BusinessException(ErrorCode.VALIDATION_FAILED, "선택할 수 없는 보기입니다.");
		}
		boolean correct = selectedLetter.equals(quiz.getCorrectOption());
		int earned = correct ? quiz.getRewardPoint() : 0;

		// 4. 풀이 기록 저장 (정답/오답 모두)
		UserQuizAttempt attempt = attemptRepository
				.save(UserQuizAttempt.of(userId, quizId, today, selectedLetter, correct, earned));

		// 5. 정답이면 보상 처리 (오답이면 기록만)
		if (correct) {
			User user = userRepository.findById(userId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
			user.addQuizReward(earned); // total_points/ranking_point += 30 (today_points 미반영)

			pointHistoryRepository.save(PointHistory.builder()
					.user(user)
					.pointAmount(earned)
					.reason("QUIZ_CORRECT")
					.relatedQuizAttemptId(attempt.getId())
					.build());

			applyExpAndEvolve(userId, earned);
			applyRankingScore(user, earned);
		}

		return new QuizDto.SubmitResponse(correct, letterToOptionNo(quiz.getCorrectOption()), quiz.getExplanation(),
				earned);
	}

	// ===== 내부 헬퍼 =====

	// 날짜 기반으로 활성 퀴즈 중 하나를 결정(매일 회전, 전원 동일)
	private Quiz selectTodaysQuiz(LocalDate today) {
		List<Quiz> active = quizRepository.findByIsActiveTrueOrderByIdAsc();
		if (active.isEmpty()) {
			throw new BusinessException(ErrorCode.QUIZ_NOT_FOUND);
		}
		int idx = (int) (today.toEpochDay() % active.size());
		return active.get(idx);
	}

	private QuizDto.TodayQuiz toTodayQuiz(Quiz quiz, boolean attempted, Boolean correct) {
		List<QuizDto.Option> options = new ArrayList<>();
		options.add(new QuizDto.Option(1, quiz.getOptionA()));
		options.add(new QuizDto.Option(2, quiz.getOptionB()));
		if (quiz.getOptionC() != null) {
			options.add(new QuizDto.Option(3, quiz.getOptionC()));
		}
		return new QuizDto.TodayQuiz(quiz.getId(), quiz.getQuestion(), options, quiz.getRewardPoint(), attempted,
				correct);
	}

	// EXP +amount 후 진화 단계 갱신 (공룡 미보유 시 스킵)
	private void applyExpAndEvolve(Long userId, int amount) {
		UserDino dino = userDinoRepository.findByUserId(userId).orElse(null);
		if (dino == null) {
			return;
		}
		int newExp = dino.getExp() + amount;
		List<LevelPolicy> policies = levelPolicyRepository.findAllByOrderBySortOrderAsc();
		LevelPolicy target = policies.get(0);
		for (LevelPolicy p : policies) {
			if (p.getRequiredExp() <= newExp) {
				target = p;
			}
		}
		boolean evolved = target.getSortOrder() > currentSortOrder(policies, dino.getStage().name());
		dino.addCleanEnergy(amount);
		if (evolved) {
			dino.evolveTo(DinoStage.valueOf(target.getLevelCode()), LocalDateTime.now());
		}
	}

	private void applyRankingScore(User user, int amount) {
		RankingSeason season = rankingSeasonRepository.findFirstByIsActiveTrue()
				.orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR, "활성 랭킹 시즌이 없습니다."));
		UserRankingScore urs = userRankingScoreRepository.findByUserIdAndSeasonId(user.getId(), season.getId())
				.orElseGet(() -> UserRankingScore.builder().userId(user.getId()).seasonId(season.getId())
						.regionId(user.getRegionId()).rankingPoint(0).completedMissionCount(0)
						.estimatedReductionKg(java.math.BigDecimal.ZERO).build());
		urs.setRankingPoint(urs.getRankingPoint() + amount);
		if (urs.getRegionId() == null) {
			urs.setRegionId(user.getRegionId());
		}
		userRankingScoreRepository.save(urs);
	}

	private int currentSortOrder(List<LevelPolicy> policies, String levelCode) {
		for (LevelPolicy p : policies) {
			if (p.getLevelCode().equals(levelCode)) {
				return p.getSortOrder();
			}
		}
		return 1;
	}

	private static String optionNoToLetter(int optionNo) {
		return switch (optionNo) {
		case 1 -> "A";
		case 2 -> "B";
		case 3 -> "C";
		default -> null;
		};
	}

	private static int letterToOptionNo(String letter) {
		return switch (letter) {
		case "A" -> 1;
		case "B" -> 2;
		case "C" -> 3;
		default -> 0;
		};
	}

	private static String optionText(Quiz quiz, String letter) {
		return switch (letter) {
		case "A" -> quiz.getOptionA();
		case "B" -> quiz.getOptionB();
		case "C" -> quiz.getOptionC();
		default -> null;
		};
	}

}
