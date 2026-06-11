package com.ecovision.app.domain.guild.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "guild_members")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@ToString
public class GuildMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "guild_id", nullable = false)
    private Long guildId;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private GuildRole role;

    @Column(name = "joined_at", insertable = false, updatable = false)
    private LocalDateTime joinedAt;

    @Column(name = "left_at")
    private LocalDateTime leftAt;
    
	private GuildMember(Long guildId, Long userId) {
		this.guildId = guildId;
		this.userId = userId;
		this.role = GuildRole.MEMBER;
	}

	public static GuildMember join(Long guildId, Long userId) {
		return new GuildMember(guildId, userId);
	}

	// 지역 변경 시 소속 길드 재매핑
	public void changeGuild(Long guildId) {
		this.guildId = guildId;
	}
}
