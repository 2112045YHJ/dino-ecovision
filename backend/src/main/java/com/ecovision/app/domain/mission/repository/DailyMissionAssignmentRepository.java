package com.ecovision.app.domain.mission.repository;

import com.ecovision.app.domain.mission.entity.DailyMissionAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyMissionAssignmentRepository extends JpaRepository<DailyMissionAssignment, Long> {

    List<DailyMissionAssignment> findByUserIdAndAssignedDate(Long userId, LocalDate assignedDate);
}
