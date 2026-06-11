package com.goldenmonkey.adoption.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentCallbackRequest {

    @NotBlank(message = "支付单号不能为空")
    private String paymentNo;

    @NotBlank(message = "订单号不能为空")
    private String orderNo;

    @NotNull(message = "支付金额不能为空")
    private java.math.BigDecimal amount;

    @NotBlank(message = "支付状态不能为空")
    private String status;

    private String transactionId;

    private String paymentMethod;
}
