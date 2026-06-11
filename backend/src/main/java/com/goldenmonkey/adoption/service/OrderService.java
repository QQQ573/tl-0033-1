package com.goldenmonkey.adoption.service;

import com.goldenmonkey.adoption.dto.CreateOrderRequest;
import com.goldenmonkey.adoption.dto.OrderVO;
import com.goldenmonkey.adoption.entity.*;
import com.goldenmonkey.adoption.repository.AdoptionOrderRepository;
import com.goldenmonkey.adoption.repository.MonkeyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private AdoptionOrderRepository orderRepository;

    @Autowired
    private MonkeyRepository monkeyRepository;

    @Autowired
    private MonkeyService monkeyService;

    @Autowired
    private TierService tierService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private CertificateService certificateService;

    @Transactional
    public OrderVO createOrder(CreateOrderRequest request) {
        Optional<Monkey> monkeyOpt = monkeyService.getMonkeyEntityById(request.getMonkeyId());
        if (monkeyOpt.isEmpty()) {
            throw new IllegalArgumentException("金丝猴不存在");
        }
        Monkey monkey = monkeyOpt.get();

        if (Boolean.TRUE.equals(monkey.getIsAdopted())) {
            throw new IllegalArgumentException("该金丝猴已被认养");
        }

        Optional<AdoptionTier> tierOpt = tierService.getTierById(request.getTierId());
        if (tierOpt.isEmpty()) {
            throw new IllegalArgumentException("认养档位不存在");
        }
        AdoptionTier tier = tierOpt.get();

        AdoptionOrder order = new AdoptionOrder();
        order.setOrderNo(generateOrderNo());
        order.setMonkeyId(request.getMonkeyId());
        order.setTierId(request.getTierId());
        order.setAdopterName(request.getAdopterName());
        order.setAdopterEmail(request.getAdopterEmail());
        order.setAdopterPhone(request.getAdopterPhone());
        order.setMessage(request.getMessage());
        order.setTotalAmount(tier.getPrice());
        order.setStatus("PENDING");

        order = orderRepository.save(order);

        Payment payment = paymentService.createPayment(order);
        order.setPaymentId(payment.getId());
        orderRepository.save(order);

        return convertToVO(order, monkey, tier);
    }

    @Transactional
    public OrderVO confirmOrder(String orderNo) {
        Optional<AdoptionOrder> orderOpt = orderRepository.findByOrderNo(orderNo);
        if (orderOpt.isEmpty()) {
            throw new IllegalArgumentException("订单不存在");
        }
        AdoptionOrder order = orderOpt.get();

        if ("COMPLETED".equals(order.getStatus())) {
            throw new IllegalStateException("订单已完成");
        }

        Optional<Payment> paymentOpt = paymentService.getPaymentByOrderId(order.getId());
        if (paymentOpt.isEmpty() || !"SUCCESS".equals(paymentOpt.get().getStatus())) {
            throw new IllegalStateException("支付未成功");
        }

        order.setStatus("COMPLETED");
        orderRepository.save(order);

        monkeyService.markAsAdopted(order.getMonkeyId());

        Optional<Monkey> monkeyOpt = monkeyService.getMonkeyEntityById(order.getMonkeyId());
        Optional<AdoptionTier> tierOpt = tierService.getTierById(order.getTierId());

        if (monkeyOpt.isPresent() && tierOpt.isPresent()) {
            Monkey monkey = monkeyOpt.get();
            AdoptionTier tier = tierOpt.get();
            Certificate certificate = certificateService.generateCertificate(order, monkey, tier);
            order.setCertificateId(certificate.getId());
            orderRepository.save(order);
        }

        return getOrderVO(order);
    }

    public Optional<OrderVO> getOrderByOrderNo(String orderNo) {
        return orderRepository.findByOrderNo(orderNo).map(this::getOrderVO);
    }

    public Optional<OrderVO> getOrderById(Long id) {
        return orderRepository.findById(id).map(this::getOrderVO);
    }

    private OrderVO getOrderVO(AdoptionOrder order) {
        Optional<Monkey> monkeyOpt = monkeyService.getMonkeyEntityById(order.getMonkeyId());
        Optional<AdoptionTier> tierOpt = tierService.getTierById(order.getTierId());
        Monkey monkey = monkeyOpt.orElse(null);
        AdoptionTier tier = tierOpt.orElse(null);
        return convertToVO(order, monkey, tier);
    }

    private OrderVO convertToVO(AdoptionOrder order, Monkey monkey, AdoptionTier tier) {
        OrderVO vo = new OrderVO();
        vo.setId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setMonkeyId(order.getMonkeyId());
        vo.setTierId(order.getTierId());
        vo.setTotalAmount(order.getTotalAmount());
        vo.setStatus(order.getStatus());
        vo.setCreatedAt(order.getCreatedAt());
        vo.setUpdatedAt(order.getUpdatedAt());

        if (monkey != null) {
            vo.setMonkeyName(monkey.getName());
            vo.setMonkeyImageUrl(monkey.getImageUrl());
        }
        if (tier != null) {
            vo.setTierName(tier.getName());
        }

        if (order.getCertificateId() != null) {
            Optional<Certificate> certOpt = certificateService.getCertificateByOrderId(order.getId());
            certOpt.ifPresent(c -> vo.setCertificateNo(c.getCertificateNo()));
        }

        return vo;
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "GM" + dateStr + uuid;
    }
}
