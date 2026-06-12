package com.ecovision.app.domain.region.dto;

public final class RegionDto {
	
	private RegionDto() {}
	
	public record RegionResponse(Long regionId, String regionCode, String regionName) {}
}
