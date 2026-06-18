package com.ecovision.app.domain.quiz.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecovision.app.domain.quiz.entity.UserQuizAttempt;

public interface UserQuizAttemptRepository extends JpaRepository<UserQuizAttempt, Long>{

	boolean existsByUserIdAndAttemptedDate(Long userId, LocalDate attemptedDate);
	
	Optional<UserQuizAttempt> findByUserIdAndAttemptedDate(Long userId, LocalDate attemptedDate);
}
