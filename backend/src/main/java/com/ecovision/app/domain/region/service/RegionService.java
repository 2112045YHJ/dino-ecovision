package com.ecovision.app.domain.region.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecovision.app.domain.region.dto.RegionDto;
import com.ecovision.app.domain.region.repository.RegionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegionService {

	private final RegionRepository regionRepository;
	
	// 지역 목록 조회
	@Transactional(readOnly = true)
	public List<RegionDto.RegionResponse> getAllRegions() {
		// 시드(id) 순서대로 정렬. 시도/가나다 순으로 하려면 sort.by 부분 변경
		return regionRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
				.map(r -> new RegionDto.RegionResponse(r.getId(), r.getRegionCode(), r.displayName()))
				.toList();
	}
}
