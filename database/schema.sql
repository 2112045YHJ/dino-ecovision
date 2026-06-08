-- =======================================================
-- EcoVision: Dino Revival MySQL 8.0 DDL 스키마 (schema.sql)
-- =======================================================

CREATE DATABASE IF NOT EXISTS `dino_ecovision` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dino_ecovision`;

-- 1. 지역 테이블
CREATE TABLE IF NOT EXISTS `regions` (
    `region_code` VARCHAR(10) NOT NULL COMMENT '행정안전부 표준 행정동 코드',
    `region_name` VARCHAR(50) NOT NULL COMMENT '지역 표시명 (예: 부산광역시 해운대구 우동)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`region_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 사용자 테이블
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(100) NOT NULL COMMENT 'BCrypt 암호화 해시',
    `nickname` VARCHAR(20) NULL UNIQUE,
    `region_code` VARCHAR(10) NULL,
    `total_points` INT NOT NULL DEFAULT 0 COMMENT '성장용 누적 포인트',
    `ranking_point` INT NOT NULL DEFAULT 0 COMMENT '경쟁용 시즌 포인트',
    `saved_carbon_kg` DECIMAL(10,4) NOT NULL DEFAULT 0.0000 COMMENT '누적 탄소 절감량',
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, INACTIVE, BANNED',
    `role` VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT 'USER, ADMIN',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL COMMENT '회원 탈퇴 일시',
    PRIMARY KEY (`id`),
    FOREIGN KEY (`region_code`) REFERENCES `regions` (`region_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 공룡 템플릿 테이블
CREATE TABLE IF NOT EXISTS `dino_templates` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `name` VARCHAR(50) NOT NULL COMMENT '공룡 종 이름 (예: 에코 티라노)',
    `type` VARCHAR(30) NOT NULL COMMENT 'TYRANO, BRACHIO, TRICERA',
    `description` VARCHAR(255) NOT NULL,
    `egg_image_url` VARCHAR(255) NOT NULL,
    `hatchling_image_url` VARCHAR(255) NOT NULL,
    `juvenile_image_url` VARCHAR(255) NOT NULL,
    `adult_image_url` VARCHAR(255) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 사용자 공룡 테이블
CREATE TABLE IF NOT EXISTS `user_dinos` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `user_id` BIGINT NOT NULL UNIQUE,
    `template_id` INT NOT NULL,
    `nickname` VARCHAR(20) NOT NULL COMMENT '공룡 개별 이름',
    `stage` VARCHAR(20) NOT NULL DEFAULT 'EGG' COMMENT 'EGG, HATCHLING, JUVENILE, ADULT',
    `exp` INT NOT NULL DEFAULT 0 COMMENT '누적 클린에너지',
    `affinity` INT NOT NULL DEFAULT 0 COMMENT '친밀도 (0~100)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
    FOREIGN KEY (`template_id`) REFERENCES `dino_templates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 공룡 해금 도감 테이블
CREATE TABLE IF NOT EXISTS `user_dino_collections` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `template_id` INT NOT NULL,
    `unlocked_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_template` (`user_id`, `template_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
    FOREIGN KEY (`template_id`) REFERENCES `dino_templates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. 미션 마스터 테이블
CREATE TABLE IF NOT EXISTS `missions` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `category` VARCHAR(50) NOT NULL COMMENT 'COOLING, HEATING, LIGHTING, STANDBY, ETC',
    `slot` VARCHAR(20) NOT NULL COMMENT 'DAY, EVENING, ANYTIME',
    `base_reward` INT NOT NULL COMMENT '기본 보상 포인트',
    `estimated_co2_kg` DECIMAL(8,4) NOT NULL COMMENT '예상 CO2 감축량',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. 일일 미션 배정 테이블
CREATE TABLE IF NOT EXISTS `daily_mission_assignments` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `mission_id` INT NOT NULL,
    `assignment_date` DATE NOT NULL COMMENT '배정 날짜 (YYYY-MM-DD)',
    `completed` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_mission_date` (`user_id`, `mission_id`, `assignment_date`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
    FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. 미션 완료 이력 테이블
CREATE TABLE IF NOT EXISTS `user_mission_results` (
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `mission_id` INT NOT NULL,
    `type` VARCHAR(20) NOT NULL COMMENT 'DAILY, DUNGEON',
    `base_reward` INT NOT NULL,
    `carbon_weight` DECIMAL(3,1) NOT NULL,
    `dungeon_multiplier` DECIMAL(3,1) NOT NULL DEFAULT 1.0,
    `earned_point` INT NOT NULL COMMENT '실제 적립된 포인트 (Capped)',
    `co2_reduced_kg` DECIMAL(8,4) NOT NULL,
    `completed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
    FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
