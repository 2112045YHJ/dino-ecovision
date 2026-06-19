package com.ecovision.app.domain.region.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DataFilterDto {
    private List<String> years;
    private List<String> regions;
}
