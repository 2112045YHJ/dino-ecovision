package com.ecovision.app.domain.guild.listener;

import com.ecovision.app.domain.guild.entity.Guild;
import com.ecovision.app.domain.guild.entity.GuildMember;
import com.ecovision.app.domain.guild.repository.GuildMemberRepository;
import com.ecovision.app.domain.guild.repository.GuildRepository;
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

    private final GuildRepository guildRepository;
    private final GuildMemberRepository guildMemberRepository;
    private final RegionRepository regionRepository;

    /**
     * 유저의 지역 변경 이벤트를 구독하여 해당 지역 길드로 자동 배정합니다.
     * 길드가 존재하지 않을 경우 방어적으로 신규 길드를 개설합니다.
     */
    @EventListener
    @Transactional
    public void handleUserRegionChanged(UserRegionChangedEvent event) {
        log.info("[GUILD ASSIGNMENT EVENT] Catching region change for user ID: {} -> New Region ID: {}", 
                event.getUserId(), event.getRegionId());

        Long userId = event.getUserId();
        Long regionId = event.getRegionId();

        if (regionId == null) {
            log.warn("[GUILD ASSIGNMENT] New Region ID is null. Cannot assign guild.");
            return;
        }

        // 1. 해당 지역에 매핑된 길드가 존재하는지 확인
        Guild guild = guildRepository.findByRegionId(regionId)
                .orElseGet(() -> {
                    // 2. 길드가 없을 시, regions 정보를 조회하여 방어적으로 신규 길드 자동 생성
                    log.info("[GUILD ASSIGNMENT] Guild not found for region ID: {}. Generating new guild...", regionId);
                    
                    Region region = regionRepository.findById(regionId)
                            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지역 ID 입니다. (ID: " + regionId + ")"));

                    String guildName = region.getSigungu() + " " + region.getDong() + " 에코가드";
                    
                    Guild newGuild = Guild.builder()
                            .guildName(guildName)
                            .description(region.getSido() + " " + region.getSigungu() + " " + region.getDong() + " 주민 에코 길드")
                            .regionId(regionId)
                            .capacity(30)
                            .totalPoint(0)
                            .savedCarbonKg(BigDecimal.ZERO)
                            .build();

                    return guildRepository.save(newGuild);
                });

        // 3. 해당 유저의 기존 길드 가입 여부 확인 (1인 1길드 정책 고수)
        GuildMember membership = guildMemberRepository.findByUserId(userId)
                .orElse(null);

        if (membership != null) {
            // A. 기존 가입 정보가 있을 경우: 길드 ID 이전 (UPDATE)
            log.info("[GUILD ASSIGNMENT UPDATE] User {} migrating from Guild {} to Guild {}", 
                    userId, membership.getGuildId(), guild.getId());
            membership.setGuildId(guild.getId());
            membership.setLeftAt(null); // 혹시 모를 탈퇴 플래그 초기화
            guildMemberRepository.save(membership);
        } else {
            // B. 신규 가입일 경우: 길드 멤버십 생성 (INSERT)
            log.info("[GUILD ASSIGNMENT INSERT] User {} newly assigned to Guild {}", userId, guild.getId());
            GuildMember newMembership = GuildMember.builder()
                    .userId(userId)
                    .guildId(guild.getId())
                    .role("MEMBER")
                    .build();
            guildMemberRepository.save(newMembership);
        }

        log.info("[GUILD ASSIGNMENT SUCCESS] User {} mapping completed to guild '{}'", userId, guild.getGuildName());
    }
}
