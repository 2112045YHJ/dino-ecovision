package com.ecovision.app.domain.community.service;

import com.ecovision.app.global.exception.BusinessException;
import com.ecovision.app.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImageUploadService {

    private final String uploadDir = "uploads";

    public String uploadImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "업로드할 파일이 비어 있습니다.");
        }

        // 5MB 용량 제한 검사
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "파일 용량은 최대 5MB를 초과할 수 없습니다.");
        }

        // 간단한 확장자 검증
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "이미지 파일만 업로드할 수 있습니다.");
        }

        try {
            // 저장할 디렉토리 생성
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 파일명 생성 (UUID + 원본 확장자)
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String savedFilename = UUID.randomUUID().toString() + extension;

            // 파일 저장
            Path path = Paths.get(uploadDir, savedFilename);
            Files.write(path, file.getBytes());

            // 접근 가능한 정적 경로 반환 (예: /uploads/uuid.png)
            return "/uploads/" + savedFilename;

        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "파일 저장 중 오류가 발생했습니다.");
        }
    }
}
