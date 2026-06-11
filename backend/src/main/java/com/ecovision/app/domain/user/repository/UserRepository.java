package com.ecovision.app.domain.user.repository;

import com.ecovision.app.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    
    boolean existsByNickname(String nickname);

    boolean existsByNicknameAndIdNot(String nickname, Long id);
    
    /**
     * 활성화 상태이고 탈퇴하지 않은 유저를 페이징 조회합니다.
     */
    Page<User> findByStatusAndDeletedAtIsNull(String status, Pageable pageable);
}
