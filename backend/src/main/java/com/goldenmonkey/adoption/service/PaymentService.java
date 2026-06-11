package com.goldenmonkey.adoption.service;

import com.goldenmonkey.adoption.dto.PaymentCallbackRequest;
import com.goldenmonkey.adoption.entity.AdoptionOrder;
import com.goldenmonkey.adoption.entity.Payment;
import com.goldenmonkey.adoption.repository.AdoptionOrderRepository;
import com.goldenmonkey.adoption.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private AdoptionOrderRepository orderRepository;

    @Autowired
    @Lazy
    private OrderService orderService;

    @Transactional
    public Payment createPayment(AdoptionOrder order) {
        Payment payment = new Payment();
        payment.setOrderId(order.getId());
        payment.setPaymentNo(generatePaymentNo());
        payment.setAmount(order.getTotalAmount());
        payment.setStatus("PENDING");
        return paymentRepository.save(payment);
    }

    public Optional<Payment> getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    public Optional<Payment> getPaymentByNo(String paymentNo) {
        return paymentRepository.findByPaymentNo(paymentNo);
    }

    @Transactional
    public Payment processPaymentCallback(PaymentCallbackRequest request) {
        Optional<Payment> paymentOpt = paymentRepository.findByPaymentNo(request.getPaymentNo());
        if (paymentOpt.isEmpty()) {
            throw new IllegalArgumentException("支付记录不存在");
        }

        Payment payment = paymentOpt.get();

        if ("SUCCESS".equals(payment.getStatus())) {
            return payment;
        }

        Optional<AdoptionOrder> orderOpt = orderRepository.findByOrderNo(request.getOrderNo());
        if (orderOpt.isEmpty()) {
            throw new IllegalArgumentException("订单不存在");
        }
        AdoptionOrder order = orderOpt.get();

        if (payment.getAmount().compareTo(request.getAmount()) != 0) {
            throw new IllegalArgumentException("支付金额不匹配");
        }

        if ("SUCCESS".equalsIgnoreCase(request.getStatus())) {
            payment.setStatus("SUCCESS");
            payment.setTransactionId(request.getTransactionId());
            payment.setPaymentMethod(request.getPaymentMethod());
            payment.setPaidAt(LocalDateTime.now());
            payment.setCallbackData(buildCallbackData(request));
            payment = paymentRepository.save(payment);

            orderService.confirmOrder(order.getOrderNo());
        } else {
            payment.setStatus("FAILED");
            payment.setCallbackData(buildCallbackData(request));
            payment = paymentRepository.save(payment);

            order.setStatus("FAILED");
            orderRepository.save(order);
        }

        return payment;
    }

    @Transactional
    public Payment simulateSuccessPayment(String orderNo) {
        Optional<AdoptionOrder> orderOpt = orderRepository.findByOrderNo(orderNo);
        if (orderOpt.isEmpty()) {
            throw new IllegalArgumentException("订单不存在");
        }
        AdoptionOrder order = orderOpt.get();

        Optional<Payment> paymentOpt = paymentRepository.findByOrderId(order.getId());
        if (paymentOpt.isEmpty()) {
            throw new IllegalArgumentException("支付记录不存在");
        }

        PaymentCallbackRequest callback = new PaymentCallbackRequest();
        callback.setPaymentNo(paymentOpt.get().getPaymentNo());
        callback.setOrderNo(orderNo);
        callback.setAmount(order.getTotalAmount());
        callback.setStatus("SUCCESS");
        callback.setTransactionId("SIM" + UUID.randomUUID().toString().replace("-", "").substring(0, 20).toUpperCase());
        callback.setPaymentMethod("SIMULATED");

        return processPaymentCallback(callback);
    }

    private String generatePaymentNo() {
        String dateStr = LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
        return "PAY" + dateStr + uuid;
    }

    private String buildCallbackData(PaymentCallbackRequest request) {
        return String.format("{\"paymentNo\":\"%s\",\"orderNo\":\"%s\",\"amount\":\"%s\",\"status\":\"%s\",\"transactionId\":\"%s\",\"paymentMethod\":\"%s\"}",
                request.getPaymentNo(), request.getOrderNo(), request.getAmount(),
                request.getStatus(), request.getTransactionId(), request.getPaymentMethod());
    }
}
