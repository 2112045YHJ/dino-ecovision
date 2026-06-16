package com.ecovision.app.domain.dungeon.repository;

import com.ecovision.app.domain.dungeon.entity.DungeonMissionAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DungeonMissionAssignmentRepository extends JpaRepository<DungeonMissionAssignment, Long> {

    /**
     * 특정 던전에 속한 특정 상태의 모든 배정 레코드를 일괄적으로 다른 상태로 업데이트합니다.
     */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE DungeonMissionAssignment d SET d.status = :newStatus WHERE d.dungeonEventId = :dungeonEventId AND d.status = :oldStatus")
    int updateStatusByDungeonEventIdAndStatus(
            @Param("dungeonEventId") Long dungeonEventId,
            @Param("oldStatus") String oldStatus,
            @Param("newStatus") String newStatus
    );
}
