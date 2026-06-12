package com.ecovision.app.domain.community.repository;

import com.ecovision.app.domain.community.entity.ChartSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ChartSnapshotRepository extends JpaRepository<ChartSnapshot, String> {
}
