package com.ecovision.app.domain.dino.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecovision.app.domain.dino.entity.UserDinoCollection;

public interface UserDinoCollectionRepository extends JpaRepository<UserDinoCollection, Long> {

	boolean existsByUserIdAndDinoTemplateId(Long userId, Long dinoTemplateId);
}
