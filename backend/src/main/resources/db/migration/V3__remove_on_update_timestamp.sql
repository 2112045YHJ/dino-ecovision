-- V3__remove_on_update_timestamp.sql
-- posts 테이블의 updated_at 컬럼에서 ON UPDATE CURRENT_TIMESTAMP 속성을 제거하여,
-- 조회수나 좋아요 증가 시 updated_at이 자동으로 갱신되는 것을 방지합니다.

ALTER TABLE posts MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
