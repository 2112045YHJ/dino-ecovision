package com.ecovision.app.domain.community.repository;

import com.ecovision.app.domain.community.entity.ChartSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChartSnapshotRepository extends JpaRepository<ChartSnapshot, String> {
    List<ChartSnapshot> findAllByUserIdOrderByCreatedAtDesc(Long userId);
}
