package com.goldenmonkey.adoption.controller;

import com.goldenmonkey.adoption.common.Result;
import com.goldenmonkey.adoption.dto.PaymentCallbackRequest;
import com.goldenmonkey.adoption.entity.Payment;
import com.goldenmonkey.adoption.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/callback")
    public Result<Map<String, Object>> callback(@Valid @RequestBody PaymentCallbackRequest request) {
        try {
            Payment payment = paymentService.processPaymentCallback(request);
            Map<String, Object> data = new HashMap<>();
            data.put("paymentNo", payment.getPaymentNo());
            data.put("status", payment.getStatus());
            data.put("paidAt", payment.getPaidAt());
            return Result.success("回调处理成功", data);
        } catch (IllegalArgumentException e) {
            return Result.badRequest(e.getMessage());
        } catch (IllegalStateException e) {
            return Result.badRequest(e.getMessage());
        }
    }

    @PostMapping("/simulate/{orderNo}")
    public Result<Map<String, Object>> simulate(@PathVariable String orderNo) {
        try {
            Payment payment = paymentService.simulateSuccessPayment(orderNo);
            Map<String, Object> data = new HashMap<>();
            data.put("paymentNo", payment.getPaymentNo());
            data.put("status", payment.getStatus());
            data.put("paidAt", payment.getPaidAt());
            data.put("transactionId", payment.getTransactionId());
            return Result.success("模拟支付成功", data);
        } catch (IllegalArgumentException e) {
            return Result.badRequest(e.getMessage());
        }
    }

    @GetMapping("/{paymentNo}")
    public Result<Payment> getByPaymentNo(@PathVariable String paymentNo) {
        return paymentService.getPaymentByNo(paymentNo)
                .map(Result::success)
                .orElse(Result.notFound("支付记录不存在"));
    }
}
