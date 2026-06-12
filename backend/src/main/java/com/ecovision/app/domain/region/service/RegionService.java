package com.ecovision.app.domain.region.service;

import com.ecovision.app.domain.region.dto.RegionDto;
import com.ecovision.app.domain.region.entity.Region;
import com.ecovision.app.domain.region.repository.RegionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegionService {

    private final RegionRepository regionRepository;

    @Transactional(readOnly = true)
    public List<RegionDto.RegionResponse> getAllRegions() {
        List<Region> regions = regionRepository.findAll();
        return regions.stream()
                .map(r -> new RegionDto.RegionResponse(
                        r.getRegionCode(),
                        r.displayName()
                ))
                .collect(Collectors.toList());
    }
}
