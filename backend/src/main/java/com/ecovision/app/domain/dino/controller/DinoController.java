package com.ecovision.app.domain.dino.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecovision.app.domain.dino.dto.DinoDto;
import com.ecovision.app.domain.dino.service.DinoService;
import com.ecovision.app.global.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

//	dino API: 공룡 부화 / 내 공룡 상태 조회 (모두 인증 필요)
@RestController
@RequestMapping("/api/me/dino")
@RequiredArgsConstructor
public class DinoController {

	private final DinoService dinoService;

	@PostMapping("/hatch")
	public ResponseEntity<ApiResponse<DinoDto.HatchResponse>> hatch(
			@AuthenticationPrincipal Long userId,
			@Valid @RequestBody DinoDto.HatchRequest request) {
		DinoDto.HatchResponse data = dinoService.hatch(userId, request);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(data));
	}

	@GetMapping
	public ApiResponse<DinoDto.DinoStatusResponse> getMyDino(@AuthenticationPrincipal Long userId) {
		return ApiResponse.success(dinoService.getMyDino(userId));
	}
}
