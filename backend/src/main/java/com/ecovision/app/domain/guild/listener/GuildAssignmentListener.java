package com.ecovision.app.domain.guild.listener;

import com.ecovision.app.domain.guild.entity.Guild;
import com.ecovision.app.domain.guild.entity.GuildMember;
import com.ecovision.app.domain.guild.repository.GuildMemberRepository;
import com.ecovision.app.domain.guild.repository.GuildRepository;
import com.ecovision.app.domain.guild.service.GuildService;
import com.ecovision.app.domain.region.entity.Region;
import com.ecovision.app.domain.region.repository.RegionRepository;
import com.ecovision.app.domain.user.event.UserRegionChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class GuildAssignmentListener {

    private final GuildService guildService;
    private final RegionRepository regionRepository;

    /**
     * 유저의 지역 변경 이벤트를 구독하여 해당 지역 길드로 자동 배정합니다.
     * 길드가 존재하지 않을 경우 방어적으로 신규 길드를 개설합니다.
     */
    @EventListener
    @Transactional
    public void handleUserRegionChanged(UserRegionChangedEvent event) {
        Long userId = event.getUserId();
        Long regionId = event.getRegionId();

        log.info("[GUILD ASSIGNMENT EVENT] Catching region change for user ID: {} -> New Region ID: {}", 
        		userId, regionId);

        if (regionId == null) {
            log.warn("[GUILD ASSIGNMENT] New Region ID is null. Cannot assign guild.");
            return;
        }

        Region region = regionRepository.findById(regionId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "존재하지 않는 지역 ID: " + regionId));
        
        // 기존 리스너 로직과 서비스 로직이 중복되는 부분을 GuildService에 위임
        guildService.assignToRegion(userId, region);

        log.info("[GUILD ASSIGNMENT SUCCESS] User {} mapping completed to guild '{}'", userId, region.getDong());
    }
}
