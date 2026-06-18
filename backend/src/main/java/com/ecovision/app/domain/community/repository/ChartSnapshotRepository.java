package com.ecovision.app.domain.community.repository;

import com.ecovision.app.domain.community.entity.ChartSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

<<<<<<< HEAD
import java.util.UUID;

@Repository
public interface ChartSnapshotRepository extends JpaRepository<ChartSnapshot, String> {
=======
import java.util.List;

@Repository
public interface ChartSnapshotRepository extends JpaRepository<ChartSnapshot, String> {
    List<ChartSnapshot> findAllByUserIdOrderByCreatedAtDesc(Long userId);
>>>>>>> feature/community-fe-setup
}
