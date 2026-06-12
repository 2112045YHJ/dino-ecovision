package com.ecovision.app.domain.mypage.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecovision.app.domain.mypage.entity.PointHistory;

public interface PointHistoryRepository extends JpaRepository<PointHistory, Long> {

}
