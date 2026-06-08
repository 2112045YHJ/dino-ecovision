package com.ecovision.app.domain.admin.repository;

import com.ecovision.app.domain.admin.entity.DataUploadLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DataUploadLogRepository extends JpaRepository<DataUploadLog, Long> {
}
