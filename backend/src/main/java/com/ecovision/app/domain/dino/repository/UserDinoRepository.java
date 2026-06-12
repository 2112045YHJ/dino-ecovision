package com.ecovision.app.domain.dino.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecovision.app.domain.dino.entity.UserDino;

public interface UserDinoRepository extends JpaRepository<UserDino, Long> {

	Optional<UserDino> findByUserId(Long userId);

	boolean existsByUserId(Long userId);
}
