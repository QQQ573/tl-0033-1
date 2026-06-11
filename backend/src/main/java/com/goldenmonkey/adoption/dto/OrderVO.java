package com.goldenmonkey.adoption.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderVO {
    private Long id;
    private String orderNo;
    private Long monkeyId;
    private String monkeyName;
    private String monkeyImageUrl;
    private Long tierId;
    private String tierName;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String certificateNo;
}
