package com.ecovision.app.domain.ranking.scheduler;

import com.ecovision.app.domain.guild.entity.GuildMember;
import com.ecovision.app.domain.guild.repository.GuildMemberRepository;
import com.ecovision.app.domain.ranking.entity.GuildRankingScore;
import com.ecovision.app.domain.ranking.entity.RankingSeason;
import com.ecovision.app.domain.ranking.entity.UserRankingScore;
import com.ecovision.app.domain.ranking.repository.GuildRankingScoreRepository;
import com.ecovision.app.domain.ranking.repository.RankingSeasonRepository;
import com.ecovision.app.domain.ranking.repository.UserRankingScoreRepository;
import com.ecovision.app.domain.user.entity.User;
import com.ecovision.app.domain.user.repository.UserRepository;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

// QueryDSL Q-Class Imports (런타임 컴파일 자동 생성 대응)
import com.ecovision.app.domain.mission.entity.QUserMissionResult;
import com.ecovision.app.domain.guild.entity.QGuildMember;
import com.ecovision.app.domain.ranking.entity.QUserRankingScore;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class RankingScheduler {

    private final JPAQueryFactory queryFactory;
    private final RankingSeasonRepository rankingSeasonRepository;
    private final UserRankingScoreRepository userRankingScoreRepository;
    private final GuildRankingScoreRepository guildRankingScoreRepository;
    private final UserRepository userRepository;
    private final GuildMemberRepository guildMemberRepository;

    /**
     * 5분 주기로 동작하여 활성 시즌의 모든 유저 및 길드별 미션 스코어를 집계하여 캐싱용 스코어 테이블을 갱신합니다.
     * Cron: "0 * / 5 * * * *" (매 5분마다 0초에 구동)
     */
    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void calculateRankingScores() {
        log.info("[RANKING SCHEDULER START] Initiating 5-minute seasonal ranking calculation...");

        // 1. 활성화된 현재 랭킹 시즌 정보 조회
        Optional<RankingSeason> activeSeasonOpt = rankingSeasonRepository.findFirstByIsActiveTrue();
        if (activeSeasonOpt.isEmpty()) {
            log.warn("[RANKING SCHEDULER] No active ranking season found. Skipping calculation.");
            return;
        }

        RankingSeason activeSeason = activeSeasonOpt.get();
        Long seasonId = activeSeason.getId();
        log.info("[RANKING SCHEDULER] Active Season: '{}' (ID: {})", activeSeason.getSeasonName(), seasonId);

        LocalDateTime startDateTime = activeSeason.getStartDate().atStartOfDay();
        LocalDateTime endDateTime = activeSeason.getEndDate().atTime(LocalTime.MAX);

        try {
            // 2. QueryDSL을 활용하여 유저별 완료 미션 점수 집계 (GROUP BY)
            QUserMissionResult userMissionResult = QUserMissionResult.userMissionResult;

            List<Tuple> userAggregates = queryFactory
                    .select(
                            userMissionResult.userId,
                            userMissionResult.id.count(),
                            userMissionResult.estimatedReductionKg.sum(),
                            userMissionResult.rankingPoint.sum()
                    )
                    .from(userMissionResult)
                    .where(
                            userMissionResult.completedAt.between(startDateTime, endDateTime)
                                    .and(userMissionResult.status.eq("COMPLETED"))
                    )
                    .groupBy(userMissionResult.userId)
                    .fetch();

            log.info("[RANKING SCHEDULER] Aggregated data for {} active users.", userAggregates.size());

            // 3. 집계된 유저 스코어를 user_ranking_scores 캐시 테이블에 반영 (Bulk Update & Insert)
            for (Tuple tuple : userAggregates) {
                Long userId = tuple.get(userMissionResult.userId);
                Long completedCount = tuple.get(userMissionResult.id.count());
                BigDecimal totalReduction = tuple.get(userMissionResult.estimatedReductionKg.sum());
                Integer totalPoints = tuple.get(userMissionResult.rankingPoint.sum());

                if (userId == null) continue;

                // 유저의 지역 정보 조회를 통한 비정규화 역정규화 데이터 보장
                Long regionId = userRepository.findById(userId)
                        .map(User::getRegionId)
                        .orElse(null);

                UserRankingScore score = userRankingScoreRepository.findByUserIdAndSeasonId(userId, seasonId)
                        .orElseGet(() -> UserRankingScore.builder()
                                .userId(userId)
                                .seasonId(seasonId)
                                .build());

                score.setRegionId(regionId);
                score.setCompletedMissionCount(completedCount != null ? completedCount.intValue() : 0);
                score.setEstimatedReductionKg(totalReduction != null ? totalReduction : BigDecimal.ZERO);
                score.setRankingPoint(totalPoints != null ? totalPoints : 0);

                userRankingScoreRepository.save(score);
            }

            // 4. QueryDSL을 활용하여 길드별 스코어 합산 집계 (길드 소속 유저들의 점수 조인 합산)
            QGuildMember guildMember = QGuildMember.guildMember;
            QUserRankingScore userRankingScore = QUserRankingScore.userRankingScore;

            List<Tuple> guildAggregates = queryFactory
                    .select(
                            guildMember.guildId,
                            userRankingScore.rankingPoint.sum(),
                            userRankingScore.completedMissionCount.sum(),
                            userRankingScore.estimatedReductionKg.sum()
                    )
                    .from(guildMember)
                    .join(userRankingScore).on(guildMember.userId.eq(userRankingScore.userId))
                    .where(
                            userRankingScore.seasonId.eq(seasonId)
                                    .and(guildMember.leftAt.isNull())
                    )
                    .groupBy(guildMember.guildId)
                    .fetch();

            log.info("[RANKING SCHEDULER] Aggregated data for {} active guilds.", guildAggregates.size());

            // 5. 집계된 길드 스코어를 guild_ranking_scores 캐시 테이블에 반영 (Bulk Update & Insert)
            for (Tuple tuple : guildAggregates) {
                Long guildId = tuple.get(guildMember.guildId);
                Integer totalPoints = tuple.get(userRankingScore.rankingPoint.sum());
                Integer completedCount = tuple.get(userRankingScore.completedMissionCount.sum());
                BigDecimal totalReduction = tuple.get(userRankingScore.estimatedReductionKg.sum());

                if (guildId == null) continue;

                GuildRankingScore guildScore = guildRankingScoreRepository.findByGuildIdAndSeasonId(guildId, seasonId)
                        .orElseGet(() -> GuildRankingScore.builder()
                                .guildId(guildId)
                                .seasonId(seasonId)
                                .build());

                guildScore.setRankingPoint(totalPoints != null ? totalPoints : 0);
                guildScore.setCompletedMissionCount(completedCount != null ? completedCount : 0);
                guildScore.setEstimatedReductionKg(totalReduction != null ? totalReduction : BigDecimal.ZERO);

                guildRankingScoreRepository.save(guildScore);
            }

            log.info("[RANKING SCHEDULER SUCCESS] Ranking caching calculation completed successfully.");

        } catch (Exception e) {
            log.error("[RANKING SCHEDULER ERROR] Critical error occurred during seasonal ranking calculation: {}", e.getMessage(), e);
        }
    }
}
