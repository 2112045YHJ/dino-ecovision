package com.ecovision.app.domain.user.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

//	regions 매핑(행정구역, 읽기 전용 시드)
//	region_code로 조회해 users, region_id에 연결

@Entity
@Table(name = "regions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Region {
	
	@Id
	private Long id;
	
	@Column(nullable = false)
	private String sido;
	
	@Column(nullable = false)
	private String sigungu;
	
	private String dong;
	
	@Column(name = "region_code", nullable = false, unique = true)
	private String regionCode;
	
	@Column(name = "created_at", insertable = false, updatable = false)
	private LocalDateTime createdAt;
	
	// 표시명 합성: "부산광역시 해운대구 우동"
	public String displayName() {
		return dong == null ? (sido + " " + sigungu) : (sido + " " + sigungu + " " + dong);
	}

}
