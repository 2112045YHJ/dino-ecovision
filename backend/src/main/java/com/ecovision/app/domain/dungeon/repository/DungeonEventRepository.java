package com.ecovision.app.domain.dungeon.repository;

import com.ecovision.app.domain.dungeon.entity.DungeonEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DungeonEventRepository extends JpaRepository<DungeonEvent, Long> {

    /**
     * 현재 활성화된 던전 이벤트 목록을 조회합니다.
     */
    List<DungeonEvent> findByStatus(String status);

    /**
     * 상태가 ACTIVE인 첫 번째 활성 던전 이벤트를 조회합니다.
     */
    Optional<DungeonEvent> findFirstByStatusOrderByStartedAtDesc(String status);
}
