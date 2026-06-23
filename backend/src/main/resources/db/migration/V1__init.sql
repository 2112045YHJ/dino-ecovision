-- V1__init.sql
-- =======================================================
-- EcoVision: Dino Revival MySQL 8.0 DDL 스키마 (schema.sql)
-- DB 설계서 v6.0 최종 스펙 반영 (2026-06-04)
-- =======================================================

SET NAMES utf8mb4;

-- CREATE DATABASE IF NOT EXISTS `dino_ecovision` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `dino_ecovision`;

-- 1. regions — 지역 정보
CREATE TABLE IF NOT EXISTS regions (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY  COMMENT '지역 고유 ID',
    sido        VARCHAR(50) NOT NULL               COMMENT '시/도',
    sigungu     VARCHAR(50) NOT NULL               COMMENT '시/군/구',
    dong        VARCHAR(50)                        COMMENT '행정동',
    region_code VARCHAR(20) NOT NULL UNIQUE        COMMENT '행정구역 코드',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='지역 정보';

-- 2. users — 회원
CREATE TABLE IF NOT EXISTS users (
    id                          BIGINT AUTO_INCREMENT PRIMARY KEY,
    email                       VARCHAR(100) NOT NULL UNIQUE   COMMENT '이메일 로그인 ID',
    password                    VARCHAR(255) NOT NULL          COMMENT '암호화 비밀번호',
    nickname                    VARCHAR(50)  NULL UNIQUE       COMMENT '닉네임',
    avatar_url                  VARCHAR(255),
    region_id                   BIGINT       COMMENT '소속 지역 ID',
    role                        VARCHAR(20)  DEFAULT 'USER'    COMMENT 'USER, ADMIN',
    status                      VARCHAR(30)  DEFAULT 'ACTIVE'  COMMENT 'ACTIVE(정상) / INACTIVE(비활성화) / BANNED(제재)',
    total_points                INT          DEFAULT 0         COMMENT '영구 누적 포인트',
    ranking_point               INT          DEFAULT 0         COMMENT '현재 시즌 랭킹 요약값 (빠른 조회용)',
    today_points_accumulated    INT          DEFAULT 0         COMMENT '당일 미션으로 획득한 누적 포인트 (상한 검증 성능 최적화용)',
    last_point_accumulated_date DATE         NULL              COMMENT '마지막 포인트 적립 일자 (날짜 다르면 today_points_accumulated 리셋)',
    saved_carbon_kg             DECIMAL(12,3) DEFAULT 0.000   COMMENT '누적 예상 탄소 감축량(kgCO2eq)',
    last_region_changed_at      TIMESTAMP NULL,
    last_nickname_changed_at    TIMESTAMP NULL,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at                  TIMESTAMP NULL DEFAULT NULL    COMMENT '사용자 직접 탈퇴 시 기록',
    CONSTRAINT fk_users_region_id FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회원 정보';

-- 3. dino_templates — 공룡 템플릿
CREATE TABLE IF NOT EXISTS dino_templates (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    dino_code           VARCHAR(50)  NOT NULL UNIQUE COMMENT '공룡 코드',
    dino_name           VARCHAR(100) NOT NULL,
    description         VARCHAR(500),
    egg_image_url       VARCHAR(255) COMMENT '알 단계 이미지 (EGG)',
    hatchling_image_url VARCHAR(255) COMMENT '부화/유아기 이미지 (HATCHLING)',
    juvenile_image_url  VARCHAR(255) COMMENT '청소년기 이미지 (JUVENILE)',
    adult_image_url     VARCHAR(255) COMMENT '성체 이미지 (ADULT)',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='공룡 템플릿';

-- 4. user_dinos — 사용자 공룡
CREATE TABLE IF NOT EXISTS user_dinos (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT NOT NULL UNIQUE,
    dino_template_id BIGINT NOT NULL,
    nickname         VARCHAR(50),
    stage            VARCHAR(30) DEFAULT 'EGG' COMMENT 'EGG(알) → HATCHLING(부화/유아기) → JUVENILE(청소년기) → ADULT(성체)',
    exp              INT DEFAULT 0,
    affinity         INT DEFAULT 0             COMMENT '친밀도(최대 100)',
    evolved_at       TIMESTAMP NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ud_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ud_template FOREIGN KEY (dino_template_id) REFERENCES dino_templates(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 공룡 정보';

-- 5. user_dino_collections — 공룡 도감 해금 정보
CREATE TABLE IF NOT EXISTS user_dino_collections (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT NOT NULL,
    dino_template_id BIGINT NOT NULL,
    unlocked_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_template (user_id, dino_template_id),
    CONSTRAINT fk_udc_user     FOREIGN KEY (user_id)          REFERENCES users(id)          ON DELETE CASCADE,
    CONSTRAINT fk_udc_template FOREIGN KEY (dino_template_id) REFERENCES dino_templates(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 공룡 도감 해금 정보';

-- 6. level_policies — 레벨/진화 기준
CREATE TABLE IF NOT EXISTS level_policies (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    level_code      VARCHAR(30)  NOT NULL UNIQUE COMMENT 'EGG / HATCHLING / JUVENILE / ADULT',
    level_name      VARCHAR(50)  NOT NULL,
    required_exp    INT          NOT NULL        COMMENT '해당 성장 단계 도달에 필요한 최소 공룡 EXP',
    badge_image_url VARCHAR(255),
    sort_order      INT          NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='레벨 및 진화 기준';

-- 7. missions — 미션 기본 정보
CREATE TABLE IF NOT EXISTS missions (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    mission_code      VARCHAR(80)   NOT NULL UNIQUE   COMMENT '미션 고유 코드',
    mission_name      VARCHAR(150)  NOT NULL,
    category          VARCHAR(50)   NOT NULL          COMMENT 'ENERGY, STANDBY, LIGHTING, RESOURCE, WASTE 등',
    slot_type         VARCHAR(30)   DEFAULT 'ANYTIME' COMMENT '시간대: DAY(오전), EVENING(저녁), ANYTIME(언제든지)',
    mission_type      VARCHAR(30)   DEFAULT 'DAILY'   COMMENT '운영 방식: DAILY, WEEKLY, DUNGEON, ONBOARDING',
    description       VARCHAR(1000),
    base_reward       INT           NOT NULL DEFAULT 20 COMMENT '기본 보상 포인트',
    proof_type        VARCHAR(30)   DEFAULT 'SELF_REPORT' COMMENT '자가 신고, 사진 인증 등',
    proof_guide_text  VARCHAR(200)  DEFAULT '자가 신고 미션입니다. 정직하게 체크해주세요.',
    is_repeatable     BOOLEAN       DEFAULT TRUE,
    is_active         BOOLEAN       DEFAULT TRUE,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='미션 기본 정보';

-- 8. unit_emission_factors — 단위별 배출계수
CREATE TABLE IF NOT EXISTS unit_emission_factors (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    factor_code   VARCHAR(80)   NOT NULL UNIQUE  COMMENT 'ELECTRICITY_KWH, PLASTIC_BAG_ONE 등',
    factor_name   VARCHAR(100)  NOT NULL,
    category      VARCHAR(50)   NOT NULL         COMMENT 'energy|water|waste|resource',
    factor_value  DECIMAL(14,8) NOT NULL,
    factor_unit   VARCHAR(100)  NOT NULL,
    formula       VARCHAR(500),
    apply_example VARCHAR(500),
    source_name   VARCHAR(255),
    source_page   VARCHAR(100),
    note          VARCHAR(1000),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='단위별 온실가스 배출계수';

-- 9. mission_emission_factors — 미션별 탄소 감축계수
CREATE TABLE IF NOT EXISTS mission_emission_factors (
    id                     BIGINT AUTO_INCREMENT PRIMARY KEY,
    mission_id             BIGINT,
    mission_code           VARCHAR(80) NOT NULL,
    calculation_type       VARCHAR(30) NOT NULL             COMMENT 'annual_fixed|unit_factor|formula|manual_point_only|hold',
    reduction_value        DECIMAL(12,6),
    reduction_unit         VARCHAR(100),
    daily_reduction_value  DECIMAL(12,6),
    weekly_reduction_value DECIMAL(12,6),
    unit_factor_code       VARCHAR(80)                      COMMENT 'unit_emission_factors.factor_code 참조',
    formula                VARCHAR(500),
    apply_status           VARCHAR(30) DEFAULT '적용 가능'  COMMENT '적용 가능|보류',
    source_name            VARCHAR(255),
    source_page            VARCHAR(100),
    note                   VARCHAR(1000),
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_mission_factor_code (mission_code),
    CONSTRAINT fk_mef_mission_id   FOREIGN KEY (mission_id)       REFERENCES missions(id)              ON DELETE SET NULL,
    CONSTRAINT fk_mef_unit_factor  FOREIGN KEY (unit_factor_code) REFERENCES unit_emission_factors(factor_code) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='미션별 예상 탄소 감축계수';

-- 10. daily_mission_assignments — 일일 미션 배정
CREATE TABLE IF NOT EXISTS daily_mission_assignments (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT   NOT NULL,
    mission_id    BIGINT   NOT NULL,
    assigned_date DATE     NOT NULL,
    slot_type     VARCHAR(30) NOT NULL              COMMENT 'DAY, EVENING, ANYTIME',
    status        VARCHAR(30) DEFAULT 'ASSIGNED'    COMMENT 'ASSIGNED, COMPLETED, EXPIRED',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_date_slot    (user_id, assigned_date, slot_type),
    UNIQUE KEY uk_user_date_mission (user_id, assigned_date, mission_id),
    CONSTRAINT fk_dma_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_dma_mission FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자별 일일 미션 배정';

-- 11. carbon_intensity_logs — 탄소집약도 기록
CREATE TABLE IF NOT EXISTS carbon_intensity_logs (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    measured_at      TIMESTAMP     NOT NULL,
    carbon_intensity DECIMAL(10,3) NOT NULL             COMMENT 'gCO2/kWh',
    status           VARCHAR(30)   NOT NULL              COMMENT 'PURIFIED, NORMAL, POLLUTED',
    carbon_weight    DECIMAL(4,2)  NOT NULL              COMMENT '1.0, 1.2, 1.5',
    reserve_rate     DECIMAL(6,2)                        COMMENT '전력 예비율',
    power_mix_json   JSON          NULL                  COMMENT '발전원별 비중 JSON',
    source           VARCHAR(100)  DEFAULT 'KPX',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_carbon_measured_at (measured_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='실시간 탄소집약도 기록';

-- 12. dungeon_events — 던전 발령 기록
CREATE TABLE IF NOT EXISTS dungeon_events (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    title             VARCHAR(100) NOT NULL,
    trigger_type      VARCHAR(30)  NOT NULL              COMMENT 'AUTO, MANUAL',
    reserve_rate      DECIMAL(6,2)                       COMMENT '전력 예비율',
    carbon_intensity  DECIMAL(10,3)                      COMMENT '탄소집약도',
    reward_multiplier DECIMAL(4,2) DEFAULT 2.00          COMMENT '던전 보상 배율',
    status            VARCHAR(30)  DEFAULT 'ACTIVE'      COMMENT 'ACTIVE, ENDED, CANCELED',
    started_at        TIMESTAMP    NOT NULL,
    ended_at          TIMESTAMP NULL                     COMMENT '던전 종료 예정 시각',
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='던전 발령 기록';

-- 13. dungeon_mission_assignments — 던전 미션 배정
CREATE TABLE IF NOT EXISTS dungeon_mission_assignments (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    dungeon_event_id  BIGINT NOT NULL,
    user_id           BIGINT NOT NULL,
    mission_id        BIGINT NOT NULL,
    status            VARCHAR(30) DEFAULT 'ASSIGNED'    COMMENT 'ASSIGNED, COMPLETED, EXPIRED',
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dma2_event   FOREIGN KEY (dungeon_event_id) REFERENCES dungeon_events(id) ON DELETE CASCADE,
    CONSTRAINT fk_dma2_user    FOREIGN KEY (user_id)          REFERENCES users(id)          ON DELETE CASCADE,
    CONSTRAINT fk_dma2_mission FOREIGN KEY (mission_id)       REFERENCES missions(id)       ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='던전 미션 배정 기록';

-- 14. user_mission_results — 미션 완료 기록
CREATE TABLE IF NOT EXISTS user_mission_results (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id                 BIGINT      NOT NULL,
    mission_id              BIGINT      NOT NULL,
    assignment_type         VARCHAR(30) NOT NULL              COMMENT 'DAILY 또는 DUNGEON',
    daily_assignment_id     BIGINT      NULL                  COMMENT '일일 미션 배정 ID',
    dungeon_assignment_id   BIGINT      NULL                  COMMENT '던전 미션 배정 ID',
    carbon_intensity_log_id BIGINT      NULL,
    completed_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    base_reward             INT NOT NULL                      COMMENT '기본 보상 포인트',
    carbon_weight           DECIMAL(4,2) DEFAULT 1.00         COMMENT '탄소집약도 보너스 배율',
    dungeon_multiplier      DECIMAL(4,2) DEFAULT 1.00         COMMENT '던전 보상 배율',
    calculated_reward       INT NOT NULL                      COMMENT '일일 상한 적용 전 계산된 최종 보상',
    earned_point            INT NOT NULL                      COMMENT '일일 상한 적용 후 실제 적립 포인트',
    daily_limit_applied     BOOLEAN DEFAULT FALSE             COMMENT '일일 상한으로 보상이 조정되었는지 여부',
    ranking_point           INT NOT NULL                      COMMENT '랭킹 반영 포인트',
    clean_energy_amount     INT DEFAULT 0                     COMMENT '미션 완료로 획득한 클린 에너지',
    estimated_reduction_kg  DECIMAL(12,3) DEFAULT 0.000,
    proof_type              VARCHAR(30) DEFAULT 'SELF_REPORT',
    proof_url               VARCHAR(255),
    status                  VARCHAR(30) DEFAULT 'COMPLETED',
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_daily_assignment_result   (daily_assignment_id),
    UNIQUE KEY uk_dungeon_assignment_result (dungeon_assignment_id),
    INDEX idx_user_completed_at (user_id, completed_at),
    CONSTRAINT fk_umr_user              FOREIGN KEY (user_id)                 REFERENCES users(id)                       ON DELETE CASCADE,
    CONSTRAINT fk_umr_mission           FOREIGN KEY (mission_id)              REFERENCES missions(id)                    ON DELETE RESTRICT,
    CONSTRAINT fk_umr_daily_assignment  FOREIGN KEY (daily_assignment_id)     REFERENCES daily_mission_assignments(id)   ON DELETE RESTRICT,
    CONSTRAINT fk_umr_dungeon_assignment FOREIGN KEY (dungeon_assignment_id)  REFERENCES dungeon_mission_assignments(id) ON DELETE RESTRICT,
    CONSTRAINT fk_umr_carbon            FOREIGN KEY (carbon_intensity_log_id) REFERENCES carbon_intensity_logs(id)       ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 미션 완료 기록';

-- 15. quizzes — 에코 퀴즈 문항
CREATE TABLE IF NOT EXISTS quizzes (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    question        VARCHAR(500)  NOT NULL                COMMENT '퀴즈 문항',
    option_a        VARCHAR(255)  NOT NULL,
    option_b        VARCHAR(255)  NOT NULL,
    option_c        VARCHAR(255),
    correct_option  VARCHAR(10)   NOT NULL                COMMENT 'A, B, C',
    explanation     VARCHAR(1000)                         COMMENT '정답 해설',
    reward_point    INT           DEFAULT 30              COMMENT '정답 보상 포인트',
    is_active       BOOLEAN       DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='에코 퀴즈 문항';

-- 16. user_quiz_attempts — 사용자 퀴즈 풀이 기록
CREATE TABLE IF NOT EXISTS user_quiz_attempts (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT        NOT NULL,
    quiz_id         BIGINT        NOT NULL,
    attempted_date  DATE          NOT NULL                COMMENT '풀이 일자',
    selected_option VARCHAR(10)   NOT NULL,
    is_correct      BOOLEAN       NOT NULL,
    earned_point    INT           DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_quiz_date (user_id, attempted_date),
    CONSTRAINT fk_uqa_user FOREIGN KEY (user_id)  REFERENCES users(id)   ON DELETE CASCADE,
    CONSTRAINT fk_uqa_quiz FOREIGN KEY (quiz_id)  REFERENCES quizzes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 에코 퀴즈 풀이 기록';

-- 17. point_history — 포인트 변동 이력
CREATE TABLE IF NOT EXISTS point_history (
    id                         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id                    BIGINT NOT NULL,
    point_amount               INT    NOT NULL          COMMENT '이번 트랜잭션에서 획득한 포인트',
    reason                     VARCHAR(100) NOT NULL    COMMENT 'MISSION_COMPLETE, QUIZ_CORRECT, POST_WRITE 등',
    related_mission_result_id  BIGINT                   COMMENT '미션 완료 보상 연결 ID',
    related_quiz_attempt_id    BIGINT                   COMMENT '퀴즈 보상 이력 연결 ID',
    created_at                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_point_user_created (user_id, created_at),
    CONSTRAINT fk_ph_user         FOREIGN KEY (user_id)                   REFERENCES users(id)             ON DELETE CASCADE,
    CONSTRAINT fk_ph_result       FOREIGN KEY (related_mission_result_id) REFERENCES user_mission_results(id) ON DELETE SET NULL,
    CONSTRAINT fk_ph_quiz_attempt FOREIGN KEY (related_quiz_attempt_id)   REFERENCES user_quiz_attempts(id)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 포인트 변동 이력';

-- 18. ranking_seasons — 랭킹 시즌
CREATE TABLE IF NOT EXISTS ranking_seasons (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    season_name VARCHAR(100) NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    is_active   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='랭킹 시즌 정보';

-- 19. user_ranking_scores — 사용자 랭킹 점수
CREATE TABLE IF NOT EXISTS user_ranking_scores (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id                 BIGINT NOT NULL,
    season_id               BIGINT NOT NULL,
    region_id               BIGINT,
    ranking_point           INT          DEFAULT 0,
    completed_mission_count INT          DEFAULT 0,
    estimated_reduction_kg  DECIMAL(12,3) DEFAULT 0.000,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_season (user_id, season_id),
    INDEX idx_region_season_score (region_id, season_id, ranking_point DESC),
    CONSTRAINT fk_urs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_urs_season FOREIGN KEY (season_id) REFERENCES ranking_seasons(id) ON DELETE CASCADE,
    CONSTRAINT fk_urs_region FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 시즌 랭킹 점수';

-- 20. guilds — 길드
CREATE TABLE IF NOT EXISTS guilds (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    guild_name       VARCHAR(100) NOT NULL                  COMMENT '길드명',
    description      VARCHAR(500),
    region_id        BIGINT       NOT NULL                  COMMENT '자동 배정 기준 지역 ID (1지역 1길드)',
    leader_user_id   BIGINT       NULL                      COMMENT '대표 사용자',
    capacity         INT          DEFAULT 30                COMMENT '길드 정원',
    total_point      INT          DEFAULT 0,
    saved_carbon_kg  DECIMAL(12,3) DEFAULT 0.000,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at       TIMESTAMP NULL DEFAULT NULL,
    UNIQUE KEY uk_guild_region (region_id),
    CONSTRAINT fk_g_region FOREIGN KEY (region_id)      REFERENCES regions(id) ON DELETE CASCADE,
    CONSTRAINT fk_g_leader FOREIGN KEY (leader_user_id) REFERENCES users(id)   ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='지역 자동 배정 길드 정보';

-- 21. guild_members — 길드 소속 정보
CREATE TABLE IF NOT EXISTS guild_members (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    guild_id   BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    role       VARCHAR(30) DEFAULT 'MEMBER'           COMMENT 'LEADER, MEMBER',
    joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at    TIMESTAMP NULL,
    UNIQUE KEY uk_user_active_guild (user_id),
    CONSTRAINT fk_gm_guild FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
    CONSTRAINT fk_gm_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='길드 멤버 정보';

-- 22. guild_ranking_scores — 길드 랭킹 점수
CREATE TABLE IF NOT EXISTS guild_ranking_scores (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    guild_id                BIGINT NOT NULL,
    season_id               BIGINT NOT NULL,
    ranking_point           INT          DEFAULT 0,
    completed_mission_count INT          DEFAULT 0,
    estimated_reduction_kg  DECIMAL(12,3) DEFAULT 0.000,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_guild_season (guild_id, season_id),
    CONSTRAINT fk_grs_guild  FOREIGN KEY (guild_id)  REFERENCES guilds(id)           ON DELETE CASCADE,
    CONSTRAINT fk_grs_season FOREIGN KEY (season_id) REFERENCES ranking_seasons(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='길드 시즌 랭킹 점수';

-- 23. chart_snapshots — 차트 공유 스냅샷
CREATE TABLE IF NOT EXISTS chart_snapshots (
    id             VARCHAR(36) PRIMARY KEY            COMMENT '공유용 UUID',
    user_id        BIGINT,
    title          VARCHAR(200),
    chart_type     VARCHAR(50)                        COMMENT 'LINE, BAR, PIE 등',
    chart_metadata JSON NOT NULL                      COMMENT '차트 필터 및 데이터 속성',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='차트 공유 스냅샷';

-- 24. posts — 게시글
CREATE TABLE IF NOT EXISTS posts (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT NOT NULL,
    category          VARCHAR(30) NOT NULL                  COMMENT 'NOTICE(공지) / GENERAL(일반) / INFO_SHARE(정보공유)',
    title             VARCHAR(200) NOT NULL,
    content           TEXT NOT NULL,
    chart_snapshot_id VARCHAR(36)                           COMMENT '첨부된 차트 스냅샷 UUID',
    dino_snapshot     JSON DEFAULT NULL                     COMMENT '작성 시점 공룡 카드 스냅샷',
    view_count        INT DEFAULT 0,
    like_count        INT DEFAULT 0,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at        TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_posts_user_created (user_id, created_at),
    CONSTRAINT fk_posts_user  FOREIGN KEY (user_id)           REFERENCES users(id)          ON DELETE RESTRICT,
    CONSTRAINT fk_posts_chart FOREIGN KEY (chart_snapshot_id) REFERENCES chart_snapshots(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='커뮤니티 게시글';

-- 25. comments — 댓글
CREATE TABLE IF NOT EXISTS comments (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id    BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    content    VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id)  ON DELETE CASCADE,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='댓글';

-- 26. post_likes — 게시글 좋아요
CREATE TABLE IF NOT EXISTS post_likes (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    post_id    BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_post_like_user_post (user_id, post_id),
    CONSTRAINT fk_pl_user FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_pl_post FOREIGN KEY (post_id) REFERENCES posts(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='게시글 좋아요';

-- 27. energy_usages — 공공 에너지 사용량 통계
CREATE TABLE IF NOT EXISTS energy_usages (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    region_id          BIGINT,
    region_code        VARCHAR(20)   NOT NULL,
    usage_year_month   VARCHAR(6)    NOT NULL              COMMENT '사용 연월 YYYYMM',
    energy_type        VARCHAR(30)   NOT NULL              COMMENT 'ELECTRICITY, GAS, WATER 등',
    usage_amount       DECIMAL(15,3) NOT NULL,
    usage_unit         VARCHAR(30)                         COMMENT 'kWh, m3 등',
    carbon_emission_kg DECIMAL(15,3)                       COMMENT '탄소 배출량 환산(kgCO2eq)',
    source_name        VARCHAR(255),
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_energy_region_date (region_code, usage_year_month),
    INDEX idx_energy_type_date   (energy_type, usage_year_month),
    CONSTRAINT fk_eu_region FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='지역별 에너지 사용량 및 탄소 배출량 통계';

-- 28. user_energy_bills — 사용자 개인 고지서 입력
CREATE TABLE IF NOT EXISTS user_energy_bills (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id              BIGINT       NOT NULL,
    bill_year_month      VARCHAR(6)   NOT NULL              COMMENT '고지서 기준 연월 YYYYMM',
    energy_type          VARCHAR(30)  NOT NULL              COMMENT 'ELECTRICITY, GAS, WATER',
    usage_amount         DECIMAL(12,3) NOT NULL             COMMENT '사용량',
    usage_unit           VARCHAR(30)                        COMMENT 'kWh, m3 등',
    cost_amount          INT                                COMMENT '요금 (원)',
    estimated_carbon_kg  DECIMAL(12,3)                      COMMENT '환산 탄소 배출량(kgCO2eq)',
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_bill_type_month (user_id, bill_year_month, energy_type),
    CONSTRAINT fk_ueb_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 개인 에너지 고지서 수동 입력';

-- 29. data_upload_logs — 관리자 CSV 업로드 이력
CREATE TABLE IF NOT EXISTS data_upload_logs (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id  BIGINT       NOT NULL,
    file_name      VARCHAR(255) NOT NULL,
    data_type      VARCHAR(50)  NOT NULL              COMMENT 'ENERGY_USAGE_CSV 등',
    total_rows     INT          DEFAULT 0,
    success_rows   INT          DEFAULT 0,
    failed_rows    INT          DEFAULT 0,
    status         VARCHAR(30)  DEFAULT 'PROCESSING'  COMMENT 'PROCESSING, SUCCESS, FAILED',
    error_message  TEXT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dul_admin FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='관리자 CSV 업로드 이력';

-- Data inserts
-- =======================================================
-- EcoVision: Dino Revival MySQL 8.0 기초 데이터 (data.sql)
-- DB 설계서 v6.0 최종 스펙 반영 (2026-06-08)
-- =======================================================

SET NAMES utf8mb4;

-- USE `dino_ecovision`;

-- 1. regions (지역 정보) 적재
INSERT INTO `regions` (`id`, `sido`, `sigungu`, `dong`, `region_code`) VALUES 
(1, '부산광역시', '해운대구', '우동', '2635051000'),
(2, '부산광역시', '해운대구', '좌동', '2635052000'),
(3, '부산광역시', '해운대구', '중동', '2635053000'),
(4, '서울특별시', '강남구', '역삼동', '1168010100');

-- 2. guilds (길드 정보) 적재 - 동네당 1길드 정책 (regions.id 외래키)
INSERT INTO `guilds` (`id`, `guild_name`, `description`, `region_id`, `capacity`) VALUES
(1, '해운대구 우동 에코가드', '부산 해운대구 우동 주민들의 친환경 탄소감축 길드', 1, 30),
(2, '해운대구 좌동 에코가드', '부산 해운대구 좌동 주민들의 친환경 탄소감축 길드', 2, 30),
(3, '해운대구 중동 에코가드', '부산 해운대구 중동 주민들의 친환경 탄소감축 길드', 3, 30),
(4, '강남구 역삼동 에코가드', '서울 강남구 역삼동 주민들의 친환경 탄소감축 길드', 4, 30);

-- 3. dino_templates (공룡 템플릿) 적재 - 4단계 이미지 포함
INSERT INTO `dino_templates` (`id`, `dino_code`, `dino_name`, `description`, `egg_image_url`, `hatchling_image_url`, `juvenile_image_url`, `adult_image_url`) VALUES
(1, 'TYRANO', '에코 티라노', '강력한 활력과 거대한 용량을 지닌 에너제틱 공룡', 'https://assets.ecovision.com/eggs/tyrano.png', 'https://assets.ecovision.com/hatchlings/tyrano.png', 'https://assets.ecovision.com/juveniles/tyrano.png', 'https://assets.ecovision.com/adults/tyrano.png'),
(2, 'SAURO', '에코 브라키오', '꾸준한 물 소비 절감에 특화된 평화로운 초식형 공룡', 'https://assets.ecovision.com/eggs/sauro.png', 'https://assets.ecovision.com/hatchlings/sauro.png', 'https://assets.ecovision.com/juveniles/sauro.png', 'https://assets.ecovision.com/adults/sauro.png'),
(3, 'CERATO', '에코 트리케라', '자원 순환 분리 배출에 두각을 나타내는 수호형 뿔 공룡', 'https://assets.ecovision.com/eggs/cerato.png', 'https://assets.ecovision.com/hatchlings/cerato.png', 'https://assets.ecovision.com/juveniles/cerato.png', 'https://assets.ecovision.com/adults/cerato.png');

-- 4. level_policies (레벨/진화 기준) 적재 - 4단계 경험치 임계값
INSERT INTO `level_policies` (`level_code`, `level_name`, `required_exp`, `sort_order`) VALUES
('EGG',       '알',          0,    1),
('HATCHLING', '부화/유아기',  100,  2),
('JUVENILE',  '청소년기',     500,  3),
('ADULT',     '성체',         1000, 4);

-- 5. unit_emission_factors (단위별 배출계수) 적재
INSERT INTO `unit_emission_factors` (`factor_code`, `factor_name`, `category`, `factor_value`, `factor_unit`, `formula`, `apply_example`, `source_name`, `source_page`) VALUES
('ELECTRICITY_KWH',  '전력',         'energy',   0.45941000, 'kgCO2eq/kWh', 'savedElectricityKwh * factorValue', '전기 절약량 계산', '부록 에너지 및 자원 단위별 온실가스 배출량', 'p.94'),
('WATER_M3',         '수도',         'water',    0.24700000, 'kgCO2eq/㎥',  'savedWaterM3 * factorValue', '물 받아쓰기, 절수 미션', '부록 에너지 및 자원 단위별 온실가스 배출량', 'p.94'),
('FOOD_WASTE_KG',    '음식물 쓰레기', 'waste',    0.15800000, 'kgCO2eq/kg',  'reducedFoodWasteKg * factorValue', '음식물 쓰레기 줄이기 미션', '부록 에너지 및 자원 단위별 온실가스 배출량', 'p.94'),
('PAPER_CUP_ONE',    '종이컵',       'resource', 0.00686000, 'kgCO2eq/개',  'reducedCount * factorValue', '1회용 컵 줄이기 미션', '부록 에너지 및 자원 단위별 온실가스 배출량', 'p.94'),
('PAPER_TOWEL_ONE',  '종이타월',     'resource', 0.00170000, 'kgCO2eq/장',  'reducedCount * factorValue', '손수건 사용 미션', '부록 에너지 및 자원 단위별 온실가스 배출량', 'p.94'),
('PLASTIC_BAG_ONE',  '비닐봉투',     'resource', 0.04748000, 'kgCO2eq/장',  'reducedCount * factorValue', '장바구니 사용 미션', '부록 에너지 및 자원 단위별 온실가스 배출량', 'p.94'),
('WET_TISSUE_ONE',   '물티슈',       'resource', 0.00122813, 'kgCO2eq/장',  'reducedCount * factorValue', '물티슈 덜 쓰기 미션', '부록 에너지 및 자원 단위별 온실가스 배출량', 'p.94'),
('A4_PAPER_ONE',     'A4 용지',      'resource', 0.00526400, 'kgCO2eq/장',  'reducedCount * factorValue', '인쇄 줄이기 미션', '부록 에너지 및 자원 단위별 온실가스 배출량', 'p.94');

-- 6. missions (미션 기본 정보) 적재
INSERT INTO `missions` (`id`, `mission_code`, `mission_name`, `category`, `slot_type`, `mission_type`, `description`, `base_reward`, `proof_type`, `proof_guide_text`) VALUES
(1,  'ENERGY_LIGHT_OFF',               '불필요한 조명기구 소등하기',                  'LIGHTING', 'DAY',     'DAILY', '사용하지 않는 공간의 조명을 1시간 이상 소등해 전력 낭비를 예방하세요.', 65, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(2,  'ENERGY_WASHER_REDUCE',           '세탁기 사용 횟수 줄이기',                    'LAUNDRY',  'ANYTIME', 'DAILY', '세탁물을 모아서 세탁 횟수를 줄이고 물과 에너지를 절약하세요.', 35, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(3,  'ENERGY_RICECOOKER_WARMOFF',       '전기밥솥 보온 시간 줄이기',                  'KITCHEN',  'EVENING', 'DAILY', '전기밥솥 보온 시간을 줄이거나, 남은 밥은 냉동 보관 후 전자레인지로 데워 드세요.', 80, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(4,  'ENERGY_HEATPAD_REDUCE',           '전기장판 사용 시간 줄이기',                  'HEATING',  'EVENING', 'DAILY', '겨울철 사용하지 않는 전기장판의 전원을 끄고 따뜻한 이불을 덮어 에너지를 아끼세요.', 80, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(5,  'ENERGY_TV_REDUCE',               '텔레비전 시청 시간 줄이기',                  'KITCHEN',  'EVENING', 'DAILY', '불필요한 TV 시청 시간을 줄이고 가족과의 대화 시간을 가져보세요.', 50, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(6,  'ENERGY_STANDBY_OFF',             '가전제품 대기전력 차단하기',                  'STANDBY',  'EVENING', 'DAILY', '사용하지 않는 가전제품의 플러그를 뽑거나 개별 멀티탭 스위치를 꺼 전력을 지키세요.', 50, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(7,  'ENERGY_TEMP_ADJUST',             '난방온도 2도 낮추고 냉방온도 2도 높이기',         'HEATING',  'ANYTIME', 'DAILY', '여름철 실내 온도는 26도 이상, 겨울철은 20도 이하로 유지하여 온실가스를 아끼세요.', 65, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(8,  'WASTE_VINYL_REDUCE',             '비닐 사용 줄이기',                          'RECYCLING', 'ANYTIME', 'DAILY', '일회용 비닐봉투 대신 다회용 장바구니를 사용하여 쇼핑하세요.', 35, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(9,  'WASTE_FOOD_REDUCE',              '음식물 쓰레기 줄이기',                        'KITCHEN',  'ANYTIME', 'DAILY', '식재료를 먹을 만큼만 조리하여 음식물 쓰레기를 남기지 마세요.', 20, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(10, 'WASTE_DISPOSABLE_REDUCE',         '음식 포장/배달 시 1회용품 사용 줄이기',          'RECYCLING', 'ANYTIME', 'DAILY', '배달 주문 시 일회용 수저나 포크류를 거절하여 쓰레기를 줄이세요.', 35, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(11, 'WASTE_CUP_REUSABLE',             '1회용 컵 대신 다회용 컵 사용하기',             'RECYCLING', 'DAY',     'DAILY', '카페 등에서 일회용 종이/플라스틱 컵 대신 텀블러나 머그잔을 이용하세요.', 50, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(12, 'WASTE_WETISSUE_REDUCE',           '물티슈 덜 쓰기',                            'RECYCLING', 'ANYTIME', 'DAILY', '물티슈 대신 개인 손수건이나 걸레 등을 빨아서 사용하세요.', 35, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(13, 'WASTE_PAPERTOWEL_HANDKERCHIEF',   '종이타월 대신 개인 손수건 사용하기',           'RECYCLING', 'ANYTIME', 'DAILY', '화장실 등에서 손을 씻은 뒤 종이타월 대신 개인 손수건을 사용해 물기를 닦으세요.', 50, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(14, 'WASTE_PAPER_PRINT_REDUCE',       '인쇄 시 종이 사용 줄이기',                    'RECYCLING', 'DAY',     'DAILY', '문서를 인쇄할 때 모아찍기나 양면 인쇄를 사용해 종이를 절약하세요.', 35, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(15, 'WASTE_E_RECEIPT',                 '전자 영수증/청구서 이용하기',                  'RECYCLING', 'ANYTIME', 'DAILY', '종이 영수증 대신 앱이나 문자 메세지로 전자 영수증을 받아보세요.', 20, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(16, 'WASTE_RECYCLE_SORT',             '재활용을 위한 분리배출 실천하기',              'RECYCLING', 'ANYTIME', 'DAILY', '페트병 라벨을 떼어내고, 플라스틱/종이/캔을 깨끗이 씻어 분리수거함에 배출하세요.', 35, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(17, 'TRANSIT_PUBLIC',                 '개인용 자동차 대신 대중교통 이용하기',          'TRANSPORT', 'DAY',     'DAILY', '등하교나 출퇴근 시 개인용 차량 대신 버스나 지하철을 적극 활용해 보세요.', 80, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.'),
(18, 'TRANSIT_WALK_BIKE',               '가까운 거리는 걷거나 자전거 이용하기',          'TRANSPORT', 'DAY',     'DAILY', '1km 내외의 가까운 거리는 차를 타지 않고 도보나 따릉이 자전거를 사용해 이동하세요.', 80, 'SELF_REPORT', '자가 신고 미션입니다. 정직하게 체크해주세요.');

-- 17, 18번 교통 미션은 비활성화(보류) 처리
UPDATE `missions` SET `is_active` = FALSE WHERE `id` IN (17, 18);

-- 7. mission_emission_factors (미션별 탄소 감축계수) 적재 (missions.id 외래키)
INSERT INTO `mission_emission_factors` (`mission_id`, `mission_code`, `calculation_type`, `reduction_value`, `reduction_unit`, `daily_reduction_value`, `weekly_reduction_value`, `unit_factor_code`, `formula`, `apply_status`, `source_name`, `source_page`) VALUES
(1,  'ENERGY_LIGHT_OFF',             'annual_fixed', 251.000000, 'kgCO2eq/가구·연간', 0.690000, 4.830000, NULL,              NULL,                                '적용 가능', '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.9'),
(2,  'ENERGY_WASHER_REDUCE',         'annual_fixed', 9.000000,   'kgCO2eq/대·연간',   0.020000, 0.170000, NULL,              NULL,                                '적용 가능', '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.9'),
(3,  'ENERGY_RICECOOKER_WARMOFF',     'annual_fixed', 458.000000, 'kgCO2eq/가구·연간', 1.250000, 8.810000, NULL,              NULL,                                '적용 가능', '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.9'),
(4,  'ENERGY_HEATPAD_REDUCE',         'annual_fixed', 315.000000, 'kgCO2eq/가구·연간', 0.860000, 6.060000, NULL,              NULL,                                '적용 가능', '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.9'),
(5,  'ENERGY_TV_REDUCE',             'annual_fixed', 73.000000,  'kgCO2eq/대·연간',   0.200000, 1.400000, NULL,              NULL,                                '적용 가능', '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.9'),
(6,  'ENERGY_STANDBY_OFF',           'annual_fixed', 85.000000,  'kgCO2eq/가구·연간', 0.230000, 1.630000, NULL,              NULL,                                '적용 가능', '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.9'),
(7,  'ENERGY_TEMP_ADJUST',           'annual_fixed', 150.000000, 'kgCO2eq/가구·연간', 0.410000, 2.880000, NULL,              NULL,                                '적용 가능', '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.9'),
(8,  'WASTE_VINYL_REDUCE',           'annual_fixed', 25.000000,  'kgCO2eq/인·연간',   0.070000, 0.480000, 'PLASTIC_BAG_ONE',  'reducedCount * factorValue',        '적용 가능', '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.31'),
(9,  'WASTE_FOOD_REDUCE',            'annual_fixed', 0.500000,   'kgCO2eq/인·연간',   0.000000, 0.010000, 'FOOD_WASTE_KG',    'reducedFoodWasteKg * factorValue',  '적용 가능', '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.31'),
(10, 'WASTE_DISPOSABLE_REDUCE',       'annual_fixed', 2.000000,   'kgCO2eq/인·연간',   0.010000, 0.040000, NULL,              NULL,                                '적용 가능', '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.31'),
(11, 'WASTE_CUP_REUSABLE',           'annual_fixed', 87.000000,  'kgCO2eq/인·연간',   0.240000, 1.670000, 'PAPER_CUP_ONE',    'reducedCount * factorValue',        '적용 가능', '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.31'),
(12, 'WASTE_WETISSUE_REDUCE',         'annual_fixed', 16.000000,  'kgCO2eq/인·연간',   0.040000, 0.310000, 'WET_TISSUE_ONE',   'reducedCount * factorValue',        '적용 가능', '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.31'),
(13, 'WASTE_PAPERTOWEL_HANDKERCHIEF', 'annual_fixed', 55.000000,  'kgCO2eq/인·연간',   0.150000, 1.060000, 'PAPER_TOWEL_ONE',  'reducedCount * factorValue',        '적용 가능', '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.31'),
(14, 'WASTE_PAPER_PRINT_REDUCE',     'annual_fixed', 15.000000,  'kgCO2eq/인·연간',   0.040000, 0.290000, 'A4_PAPER_ONE',     'reducedCount * factorValue',        '적용 가능', '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.31'),
(15, 'WASTE_E_RECEIPT',               'annual_fixed', 0.800000,   'kgCO2eq/인·연간',   0.000000, 0.020000, NULL,              NULL,                                '적용 가능', '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.31'),
(16, 'WASTE_RECYCLE_SORT',           'annual_fixed', 19.000000,  'kgCO2eq/인·연간',   0.050000, 0.370000, NULL,              NULL,                                '적용 가능', '환경부·환경보전원 탄소중립 생활 실천 안내서', 'p.31'),
(17, 'TRANSIT_PUBLIC',               'annual_fixed', 242.000000, 'kgCO2eq/대·연간',   0.660000, 4.650000, NULL,              NULL,                                '보류',      '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.27'),
(18, 'TRANSIT_WALK_BIKE',             'annual_fixed', 147.000000, 'kgCO2eq/대·연간',   0.400000, 2.830000, NULL,              NULL,                                '보류',      '환경부·한국환경보전원 탄소중립 생활 실천 안내서', 'p.27');

-- 8. quizzes (에코 퀴즈 문항) 적재
INSERT INTO `quizzes` (`id`, `question`, `option_a`, `option_b`, `option_c`, `correct_option`, `explanation`, `reward_point`) VALUES
(1, '안 쓰는 가전제품의 플러그를 뽑으면 대기전력을 약 몇 % 절감할 수 있을까요?', '10%', '30%', '50%', 'A', '가전제품의 플러그를 뽑거나 개별 스위치 멀티탭을 끄는 것만으로도 전체 전력 사용량의 약 10%를 절약할 수 있습니다.', 30),
(2, '다음 중 온실가스 배출량이 가장 적은 컵은 무엇일까요?', '일회용 플라스틱 컵', '일회용 종이컵', '개인 텀블러(다회용 컵)', 'C', '개인 텀블러는 수백 번 이상 재사용할 경우 일회용 플라스틱이나 종이컵에 비해 온실가스 감축 효과가 월등히 큽니다.', 30),
(3, '여름철 실내 적정 냉방 온도로 적합한 것은?', '18도~20도', '22도~24도', '26도~28도', 'C', '에어컨 냉방 온도를 2도만 높여 설정해도 연간 온실가스 배출량을 약 150kg 감축할 수 있습니다.', 30);

-- 9. ranking_seasons (랭킹 시즌) 적재
INSERT INTO `ranking_seasons` (`id`, `season_name`, `start_date`, `end_date`, `is_active`) VALUES
(1, '2026 에코 서머 시즌 1', '2026-06-01', '2026-08-31', TRUE);
