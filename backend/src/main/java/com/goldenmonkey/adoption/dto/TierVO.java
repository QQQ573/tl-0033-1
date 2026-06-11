package com.goldenmonkey.adoption.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TierVO {
    private Long id;
    private String name;
    private String code;
    private BigDecimal price;
    private Integer durationMonths;
    private String description;
    private String benefits;
    private String badgeImageUrl;
    private Integer sortOrder;
}
