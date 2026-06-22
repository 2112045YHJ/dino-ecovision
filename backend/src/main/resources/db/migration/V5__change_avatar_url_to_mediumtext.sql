-- V5__change_avatar_url_to_mediumtext.sql
ALTER TABLE users MODIFY COLUMN avatar_url MEDIUMTEXT COMMENT '프로필 이미지(Base64)';
