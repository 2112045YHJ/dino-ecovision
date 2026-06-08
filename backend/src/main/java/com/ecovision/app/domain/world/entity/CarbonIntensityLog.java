package com.ecovision.app.domain.world.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "carbon_intensity_logs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@ToString
public class CarbonIntensityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "measured_at", nullable = false)
    private LocalDateTime measuredAt;

    @Column(name = "carbon_intensity", nullable = false, precision = 10, scale = 3)
    private BigDecimal carbonIntensity;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "carbon_weight", nullable = false, precision = 4, scale = 2)
    private BigDecimal carbonWeight;

    @Column(name = "reserve_rate", precision = 6, scale = 2)
    private BigDecimal reserveRate;

    @Column(name = "power_mix_json", columnDefinition = "json")
    private String powerMixJson;

    @Column(name = "source", length = 100)
    @Builder.Default
    private String source = "KPX";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
