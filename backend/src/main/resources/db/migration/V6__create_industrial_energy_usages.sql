-- V6__create_industrial_energy_usages.sql
CREATE TABLE IF NOT EXISTS industrial_energy_usages (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    target_year        VARCHAR(4)    NOT NULL              COMMENT '대상 연도 YYYY',
    industry_code      VARCHAR(20)   NOT NULL              COMMENT '표준산업분류 코드',
    data_division_code VARCHAR(30)   NOT NULL              COMMENT '자료 구분 코드 (CO2, TOE 등)',
    energy_source_name VARCHAR(100)                        COMMENT '에너지원 명',
    region_code        VARCHAR(50)   NOT NULL              COMMENT '지역 구분 명',
    usage_amount       DECIMAL(15,3) NOT NULL              COMMENT '사용/배출량',
    unit_name          VARCHAR(30)                         COMMENT '단위 명',
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ind_energy_region_year (region_code, target_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='산업부문 에너지 사용 및 온실가스 배출량 통계';
