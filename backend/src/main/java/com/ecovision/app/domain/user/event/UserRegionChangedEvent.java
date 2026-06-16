package com.ecovision.app.domain.user.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

@Getter
@RequiredArgsConstructor
@ToString
public class UserRegionChangedEvent {
    private final Long userId;
    private final Long regionId;
}
