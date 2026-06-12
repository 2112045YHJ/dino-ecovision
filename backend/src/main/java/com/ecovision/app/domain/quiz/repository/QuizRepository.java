package com.ecovision.app.domain.quiz.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecovision.app.domain.quiz.entity.Quiz;

public interface QuizRepository extends JpaRepository<Quiz, Long>{

	List<Quiz> findByIsActiveTrueOrderByIdAsc();
	
}
