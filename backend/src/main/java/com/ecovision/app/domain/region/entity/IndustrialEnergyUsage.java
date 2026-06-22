package com.ecovision.app.domain.region.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "industrial_energy_usages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@ToString
@EntityListeners(AuditingEntityListener.class)
public class IndustrialEnergyUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "target_year", nullable = false, length = 4)
    private String targetYear;

    @Column(name = "industry_code", nullable = false, length = 20)
    private String industryCode;

    @Column(name = "data_division_code", nullable = false, length = 30)
    private String dataDivisionCode;

    @Column(name = "energy_source_name", length = 100)
    private String energySourceName;

    @Column(name = "region_code", nullable = false, length = 50)
    private String regionCode;

    @Column(name = "usage_amount", nullable = false, precision = 15, scale = 3)
    private BigDecimal usageAmount;

    @Column(name = "unit_name", length = 30)
    private String unitName;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
