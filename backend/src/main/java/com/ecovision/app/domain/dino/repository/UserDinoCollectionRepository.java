package com.ecovision.app.domain.dino.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecovision.app.domain.dino.entity.UserDinoCollection;

public interface UserDinoCollectionRepository extends JpaRepository<UserDinoCollection, Long> {

	boolean existsByUserIdAndDinoTemplateId(Long userId, Long dinoTemplateId);
	//	도감 조회용: 사용자가 해금한 모든 컬렉션 행. (해금 여부 + unlockedAt 산출에 사용)
	List<UserDinoCollection> findAllByUserId(Long userId);
}
