-- =======================================================
-- EcoVision: Dino Revival MySQL 8.0 기초 데이터 (data.sql)
-- =======================================================

USE `dino_ecovision`;

-- 1. 지역 기초 데이터 적재
INSERT INTO `regions` (`region_code`, `region_name`) VALUES 
('2635051000', '부산광역시 해운대구 우동'),
('2635052000', '부산광역시 해운대구 좌동'),
('2635053000', '부산광역시 해운대구 중동'),
('1168010100', '서울특별시 강남구 역삼동');

-- 2. 공룡 템플릿 데이터 적재
INSERT INTO `dino_templates` (`id`, `name`, `type`, `description`, `egg_image_url`, `hatchling_image_url`, `juvenile_image_url`, `adult_image_url`) VALUES
(1, '에코 티라노', 'TYRANO', '강력한 활력과 거대한 용량을 지닌 에너제틱 공룡', 'https://assets.ecovision.com/eggs/tyrano.png', 'https://assets.ecovision.com/hatchlings/tyrano.png', 'https://assets.ecovision.com/juveniles/tyrano.png', 'https://assets.ecovision.com/adults/tyrano.png'),
(2, '에코 브라키오', 'BRACHIO', '꾸준한 물 소비 절감에 특화된 평화로운 초식형 공룡', 'https://assets.ecovision.com/eggs/brachio.png', 'https://assets.ecovision.com/hatchlings/brachio.png', 'https://assets.ecovision.com/juveniles/brachio.png', 'https://assets.ecovision.com/adults/brachio.png'),
(3, '에코 트리케라', 'TRICERA', '자원 순환 분리 배출에 두각을 나타내는 수호형 뿔 공룡', 'https://assets.ecovision.com/eggs/tricera.png', 'https://assets.ecovision.com/hatchlings/tricera.png', 'https://assets.ecovision.com/juveniles/tricera.png', 'https://assets.ecovision.com/adults/tricera.png');

-- 3. 친환경 일일 미션 마스터 데이터 적재
INSERT INTO `missions` (`id`, `title`, `description`, `category`, `slot`, `base_reward`, `estimated_co2_kg`) VALUES
(1, '낮에 안 쓰는 방 조명 소등하기', '사용하지 않는 공간의 조명을 1시간 이상 소등해 전력 낭비를 예방하세요.', 'LIGHTING', 'DAY', 65, 0.6880),
(2, '가전제품 대기전력 콘센트 차단하기', '사용하지 않는 가전제품의 플러그를 뽑거나 개별 멀티탭 스위치를 꺼 전력을 지키세요.', 'STANDBY', 'EVENING', 50, 0.2330),
(3, '외출 시 에어컨 전원 Off 확인하기', '여름철 외출 전 에어컨이 꺼져있는지 반드시 확인하여 탄소 배출을 예방하세요.', 'COOLING', 'ANYTIME', 80, 1.2500),
(4, '가정 내 난방 온도 1도 낮추기', '실내 난방 온도를 1도 낮추고 따뜻한 내의를 착용해 난방 에너지를 아끼세요.', 'HEATING', 'ANYTIME', 70, 0.9450),
(5, '대중교통 이용해 이동하기', '오늘 등하교나 출퇴근 시 자가용 대신 버스나 지하철을 한 번 이상 이용하세요.', 'ETC', 'DAY', 70, 0.9600),
(6, '텀블러 및 다회용 컵 사용하기', '일회용 종이컵이나 플라스틱 컵 대신 본인의 텀블러를 사용하여 음료를 주문하세요.', 'ETC', 'ANYTIME', 30, 0.1500);
