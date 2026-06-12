package com.ecovision.app.domain.region.dto;

public final class RegionDto {
    private RegionDto() {}

    public record RegionResponse(
            String regionCode,
            String regionName
    ) {}
}
