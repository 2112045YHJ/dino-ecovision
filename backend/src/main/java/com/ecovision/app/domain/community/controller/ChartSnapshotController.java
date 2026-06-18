package com.ecovision.app.domain.community.controller;

import com.ecovision.app.domain.community.dto.CommunityDto;
import com.ecovision.app.domain.community.service.CommunityService;
import com.ecovision.app.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/charts")
@RequiredArgsConstructor
public class ChartSnapshotController {

    private final CommunityService communityService;

    @PostMapping("/snapshot")
    public ResponseEntity<ApiResponse<CommunityDto.ChartSnapshotResponse>> createSnapshot(
            @Valid @RequestBody CommunityDto.ChartSnapshotRequest request,
            @AuthenticationPrincipal Long userId) {
        CommunityDto.ChartSnapshotResponse response = communityService.createSnapshot(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/snapshot/{id}")
    public ResponseEntity<ApiResponse<CommunityDto.ChartSnapshotResponse>> getSnapshot(@PathVariable String id) {
        CommunityDto.ChartSnapshotResponse response = communityService.getSnapshot(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
<<<<<<< HEAD
=======

    @GetMapping("/snapshot")
    public ResponseEntity<ApiResponse<java.util.List<CommunityDto.ChartSnapshotResponse>>> getMySnapshots(
            @AuthenticationPrincipal Long userId) {
        java.util.List<CommunityDto.ChartSnapshotResponse> response = communityService.getUserSnapshots(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
>>>>>>> feature/community-fe-setup
}
