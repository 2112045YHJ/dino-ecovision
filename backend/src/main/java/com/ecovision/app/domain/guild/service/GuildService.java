package com.ecovision.app.domain.guild.service;

import org.springframework.stereotype.Service;

import com.ecovision.app.domain.guild.entity.Guild;
import com.ecovision.app.domain.guild.entity.GuildMember;
import com.ecovision.app.domain.guild.repository.GuildMemberRepository;
import com.ecovision.app.domain.guild.repository.GuildRepository;
import com.ecovision.app.domain.region.entity.Region;

import lombok.RequiredArgsConstructor;

//	지역 기준 길드 자동 배정 (find-or-create).
//	온보딩/지역변경 트랜잭션 안에서 호출되므로 별도 @Transactional 없이 호출자 트랜잭션에 참여한다.
@Service
@RequiredArgsConstructor
public class GuildService {

	private final GuildRepository guildRepository;
	private final GuildMemberRepository guildMemberRepository;

	// 해당 지역 길드를 찾고, 없으면 생성한 뒤 사용자를 소속시킨다(이미 소속이면 길드만 재매핑).
	public void assignToRegion(Long userId, Region region) {
		Guild guild = guildRepository.findByRegionId(region.getId())
				.orElseGet(() -> guildRepository.save(Guild.createForRegion(region)));

		guildMemberRepository.findByUserId(userId)
				.ifPresentOrElse(
						member -> member.changeGuild(guild.getId()),
						() -> guildMemberRepository.save(GuildMember.join(guild.getId(), userId)));
	}
}
