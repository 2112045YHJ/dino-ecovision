package com.ecovision.app.domain.region.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "regions")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@ToString
public class Region {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sido", nullable = false, length = 50)
    private String sido;

    @Column(name = "sigungu", nullable = false, length = 50)
    private String sigungu;

    @Column(name = "dong", length = 50)
    private String dong;

    @Column(name = "region_code", nullable = false, unique = true, length = 20)
    private String regionCode;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // 표시명 합성: "부산광역시 해운대구 우동"
    public String displayName() {
        return dong == null ? (sido + " " + sigungu) : (sido + " " + sigungu + " " + dong);
    }
}
