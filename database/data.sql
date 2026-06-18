-- =======================================================
-- EcoVision: Dino Revival MySQL 8.0 기초 데이터 (data.sql)
-- DB 설계서 v6.0 최종 스펙 반영 (2026-06-08)
-- =======================================================

SET NAMES utf8mb4;

USE `dino_ecovision`;

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

-- 10. users 관리자 계정 추가
INSERT INTO users (
    id, email, password, nickname, avatar_url, 
    region_id, role, status, total_points, ranking_point, 
    today_points_accumulated, last_point_accumulated_date, saved_carbon_kg, 
    last_region_changed_at, last_nickname_changed_at, created_at, updated_at, deleted_at
) VALUES (
    1, 'admin@example.com', '$2a$10$4OzfDb97/VOE2kzOCqT2IONV5an9L9rvmwKNULsaaUPttomrH2mZq', 'admin', NULL, 
    1, 'ADMIN', 'ACTIVE', 0, 0, 
    0, '2026-06-12', 0.0, 
    '2026-06-12 11:54:52', '2026-06-12 11:54:52', '2026-06-12 01:57:31', '2026-06-12 03:33:52', NULL
);

-- 11. dino 관리자 공룡 추가
INSERT INTO `user_dinos` (`id`, `user_id`, `dino_template_id`, `nickname`, `stage`, `exp`, `affinity`, `evolved_at`, `created_at`, `updated_at`) VALUES (1, 1, 1, 'adminDino', 'EGG', 0, 0, NULL, '2026-06-12 07:41:11', '2026-06-12 07:41:11');

-- 12. missions - 던전 미션 적재
INSERT INTO `missions`
    (`id`, `mission_code`, `mission_name`, `category`, `slot_type`, `mission_type`,
     `description`, `base_reward`, `proof_type`, `proof_guide_text`)
VALUES
    (101, 'DUNGEON_AC_PAUSE',      '[던전] 에어컨 사용 일시 정지하기', 'HEATING', 'ANYTIME', 'DUNGEON',
     '전력 피크 경보! 에어컨을 잠시 꺼 피크 부하를 낮춥니다.', 50, 'SELF_REPORT',
     '자가 신고 미션입니다. 정직하게 체크해주세요.'),
    (102, 'DUNGEON_MAIN_LIGHT_OFF', '[던전] 불필요한 메인 전등 전체 소등', 'LIGHTING', 'ANYTIME', 'DUNGEON',
     '전력 피크 경보! 메인 조명을 소등해 즉시 절전합니다.', 50, 'SELF_REPORT',
     '자가 신고 미션입니다. 정직하게 체크해주세요.'),
    (103, 'DUNGEON_STANDBY_CUT',   '[던전] 멀티탭 대기전력 일괄 차단', 'STANDBY', 'ANYTIME', 'DUNGEON',
     '전력 피크 경보! 멀티탭 스위치를 내려 대기전력을 차단합니다.', 50, 'SELF_REPORT',
     '자가 신고 미션입니다. 정직하게 체크해주세요.'),
    (104, 'DUNGEON_LAUNDRY_DEFER', '[던전] 세탁기·건조기 사용 미루기', 'LAUNDRY', 'ANYTIME', 'DUNGEON',
     '전력 피크 경보! 고출력 가전 사용을 피크 시간 이후로 미룹니다.', 50, 'SELF_REPORT',
     '자가 신고 미션입니다. 정직하게 체크해주세요.');

-- 13. mission_emission_factors - 던전 미션 감축계수 추가
INSERT INTO `mission_emission_factors`
    (`mission_id`, `mission_code`, `calculation_type`, `daily_reduction_value`, `reduction_unit`, `apply_status`)
VALUES
    (101, 'DUNGEON_AC_PAUSE',       'annual_fixed', 0.500, 'kgCO2/일', '적용 가능'),
    (102, 'DUNGEON_MAIN_LIGHT_OFF', 'annual_fixed', 0.680, 'kgCO2/일', '적용 가능'),
    (103, 'DUNGEON_STANDBY_CUT',    'annual_fixed', 0.300, 'kgCO2/일', '적용 가능'),
    (104, 'DUNGEON_LAUNDRY_DEFER',  'annual_fixed', 0.450, 'kgCO2/일', '적용 가능');

