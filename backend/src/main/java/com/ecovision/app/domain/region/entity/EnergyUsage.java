package com.ecovision.app.domain.region.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "energy_usages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class EnergyUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "region_id")
    private Long regionId;

    @Column(name = "region_code", nullable = false, length = 20)
    private String regionCode;

    @Column(name = "usage_year_month", nullable = false, length = 7)
    private String usageYearMonth; // 'YYYY-MM' 또는 'YYYYMM' 형식

    @Enumerated(EnumType.STRING)
    @Column(name = "energy_type", nullable = false, length = 30)
    private EnergyType energyType;

    @Column(name = "usage_amount", nullable = false)
    private BigDecimal usageAmount;

    @Column(name = "usage_unit", length = 30)
    private String usageUnit;

    @Column(name = "carbon_emission_kg")
    private BigDecimal carbonEmissionKg;

    @Column(name = "source_name", length = 255)
    private String sourceName;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
