package com.ecovision.app.domain.user.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MypageCommentsResponse {
    private String content;
    private Long postId;
    private String postTitle;
    private LocalDateTime createdAt;
}
