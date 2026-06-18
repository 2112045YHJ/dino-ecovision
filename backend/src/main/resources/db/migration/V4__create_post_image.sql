-- V4__create_post_image.sql
-- 게시글 본문 이미지 상태 추적 관리 테이블 추가

CREATE TABLE IF NOT EXISTS post_images (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY  COMMENT '이미지 고유 ID',
    image_url   VARCHAR(255) NOT NULL UNIQUE       COMMENT '이미지 웹 접근 URL 경로',
    status      VARCHAR(20) NOT NULL DEFAULT 'UNMAPPED' COMMENT '매핑 상태: UNMAPPED(미매핑) / MAPPED(매핑됨)',
    post_id     BIGINT NULL                        COMMENT '소속 게시글 ID',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '이미지 업로드 일시',
    CONSTRAINT fk_post_images_post_id FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='게시글 본문 이미지 상태 추적 관리';
