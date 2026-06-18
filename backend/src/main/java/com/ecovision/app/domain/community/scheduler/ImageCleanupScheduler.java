package com.ecovision.app.domain.community.scheduler;

import com.ecovision.app.domain.community.entity.PostImage;
import com.ecovision.app.domain.community.entity.PostImageStatus;
import com.ecovision.app.domain.community.repository.PostImageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ImageCleanupScheduler {

    private final PostImageRepository postImageRepository;
    private final String uploadDir = "uploads";

    @Scheduled(cron = "0 0 3 * * *") // 매일 새벽 3시
    @SchedulerLock(name = "imageCleanupJob", lockAtLeastFor = "PT10M", lockAtMostFor = "PT30M")
    @Transactional
    public void cleanupOrphanImages() {
        log.info("Starting Image Cleanup Scheduler Job...");

        // 24시간 전에 생성된 UNMAPPED 이미지 조회
        LocalDateTime limitTime = LocalDateTime.now().minusHours(24);
        List<PostImage> orphanImages = postImageRepository.findAllByStatusAndCreatedAtBefore(
                PostImageStatus.UNMAPPED, limitTime
        );

        if (orphanImages.isEmpty()) {
            log.info("No orphan images found to clean.");
            return;
        }

        log.info("Found {} orphan images to clean.", orphanImages.size());

        for (PostImage postImage : orphanImages) {
            String url = postImage.getImageUrl();
            if (url != null && url.startsWith("/uploads/")) {
                String fileName = url.substring(url.lastIndexOf("/") + 1);
                Path path = Paths.get(uploadDir, fileName);
                try {
                    boolean deleted = Files.deleteIfExists(path);
                    if (deleted) {
                        log.info("Physically deleted orphan image file: {}", path);
                    } else {
                        log.warn("File did not exist physically: {}", path);
                    }
                } catch (IOException e) {
                    log.error("Failed to physically delete file: {}", path, e);
                }
            }
        }

        // DB에서 일괄 제거
        postImageRepository.deleteInBatch(orphanImages);
        log.info("Successfully completed Image Cleanup Scheduler Job. DB records deleted.");
    }
}
