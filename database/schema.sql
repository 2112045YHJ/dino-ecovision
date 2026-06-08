-- =======================================================
-- EcoVision: Dino Revival MySQL 8.0 DDL 스키마 (schema.sql)
-- DB 설계서 v6.0 최종 스펙 반영 (2026-06-04)
-- =======================================================

CREATE DATABASE IF NOT EXISTS `dino_ecovision` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dino_ecovision`;

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
    nickname                    VARCHAR(50)  NOT NULL UNIQUE   COMMENT '닉네임',
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
    INDEX idx_region_season_score (region_id, season_id, ranking_point),
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
