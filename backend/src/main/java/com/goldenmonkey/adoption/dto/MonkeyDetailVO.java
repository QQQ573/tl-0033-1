package com.goldenmonkey.adoption.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MonkeyDetailVO {
    private Long id;
    private String name;
    private String code;
    private String gender;
    private Integer age;
    private String healthStatus;
    private String habitat;
    private String personality;
    private String story;
    private String imageUrl;
    private Boolean isAdopted;
    private LocalDateTime createdAt;
}
