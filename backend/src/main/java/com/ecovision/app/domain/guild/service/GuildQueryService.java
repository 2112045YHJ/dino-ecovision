package com.ecovision.app.domain.guild.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecovision.app.domain.guild.dto.GuildDto;
import com.ecovision.app.domain.guild.entity.Guild;
import com.ecovision.app.domain.guild.entity.GuildMember;
import com.ecovision.app.domain.guild.repository.GuildMemberRepository;
import com.ecovision.app.domain.guild.repository.GuildProjections;
import com.ecovision.app.domain.guild.repository.GuildQueryRepository;
import com.ecovision.app.domain.guild.repository.GuildRepository;
import com.ecovision.app.domain.ranking.entity.RankingSeason;
import com.ecovision.app.domain.ranking.repository.RankingSeasonRepository;
import com.ecovision.app.domain.region.entity.Region;
import com.ecovision.app.domain.region.repository.RegionRepository;
import com.ecovision.app.global.exception.BusinessException;
import com.ecovision.app.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

//	길드 조회: 내 길드(7.1) / 멤버 목록(7.2) / 전국 랭킹(7.3).
//	기존 GuildService(자동 배정)와 분리한 읽기 전용 서비스.
@Service
@RequiredArgsConstructor
public class GuildQueryService {

	private final GuildRepository guildRepository;
	private final GuildMemberRepository guildMemberRepository;
	private final GuildQueryRepository guildQueryRepository;
	private final RankingSeasonRepository rankingSeasonRepository;
	private final RegionRepository regionRepository;

	// ===== 7.1 내 길드 =====

	@Transactional(readOnly = true)
	public GuildDto.MyGuildResponse getMyGuild(Long userId) {
		RankingSeason season = activeSeason();
		Long seasonId = season.getId();

		// 내 길드 소속 (활성). 미배정이면 404.
		GuildMember membership = guildMemberRepository.findByUserId(userId)
				.filter(m -> m.getLeftAt() == null)
				.orElseThrow(() -> new BusinessException(ErrorCode.GUILD_NOT_FOUND));
		Long guildId = membership.getGuildId();

		Guild guild = guildRepository.findById(guildId)
				.orElseThrow(() -> new BusinessException(ErrorCode.GUILD_NOT_FOUND));

		String regionCode = regionRepository.findById(guild.getRegionId())
				.map(Region::getRegionCode)
				.orElse(null);

		int seasonScore = nz(guildQueryRepository.findGuildSeasonScore(guildId, seasonId));
		int nationalRank = (int) (guildQueryRepository.countGuildsAbove(seasonId, seasonScore) + 1);
		int memberCount = (int) guildQueryRepository.countActiveMembers(guildId);

		// 내 기여: user_ranking_scores. 미참여면 null → 기여순위도 null.
		Integer myContribObj = guildQueryRepository.findMyContribution(userId, seasonId);
		int myContribution = nz(myContribObj);
		Integer myContributionRank = (myContribObj == null)
				? null
				: (int) (guildQueryRepository.countMembersAboveInGuild(guildId, seasonId, myContribution) + 1);

		return new GuildDto.MyGuildResponse(
				guild.getId(), guild.getGuildName(), regionCode,
				seasonScore, nationalRank, memberCount, guild.getCapacity(),
				myContribution, myContributionRank);
	}

	// ===== 7.2 멤버 목록 =====

	@Transactional(readOnly = true)
	public List<GuildDto.MemberEntry> getMyGuildMembers(Long userId) {
		RankingSeason season = activeSeason();

		GuildMember membership = guildMemberRepository.findByUserId(userId)
				.filter(m -> m.getLeftAt() == null)
				.orElseThrow(() -> new BusinessException(ErrorCode.GUILD_NOT_FOUND));

		List<GuildProjections.MemberRow> rows =
				guildQueryRepository.findGuildMembers(membership.getGuildId(), season.getId());

		List<GuildDto.MemberEntry> result = new ArrayList<>(rows.size());
		for (GuildProjections.MemberRow row : rows) {
			result.add(new GuildDto.MemberEntry(
					row.getUserId(), row.getNickname(), row.getRole(), nz(row.getSeasonContribution())));
		}
		return result;
	}

	// ===== 7.3 전국 랭킹 =====

	@Transactional(readOnly = true)
	public List<GuildDto.GuildRankEntry> getGuildRanking(int page, int size) {
		RankingSeason season = activeSeason();
		Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));

		List<GuildProjections.GuildRankRow> rows =
				guildQueryRepository.findGuildRanking(season.getId(), pageable);

		int baseRank = pageable.getPageNumber() * pageable.getPageSize();
		List<GuildDto.GuildRankEntry> result = new ArrayList<>(rows.size());
		for (int i = 0; i < rows.size(); i++) {
			GuildProjections.GuildRankRow row = rows.get(i);
			result.add(new GuildDto.GuildRankEntry(
					baseRank + i + 1,
					row.getGuildId(), row.getName(), row.getRegionName(), nz(row.getSeasonScore())));
		}
		return result;
	}

	// ===== 공통 =====

	private RankingSeason activeSeason() {
		return rankingSeasonRepository.findFirstByIsActiveTrue()
				.orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR, "활성 랭킹 시즌이 없습니다."));
	}

	private static int nz(Integer v) {
		return v == null ? 0 : v;
	}
}