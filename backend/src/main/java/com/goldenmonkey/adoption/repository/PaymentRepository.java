package com.goldenmonkey.adoption.repository;

import com.goldenmonkey.adoption.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByPaymentNo(String paymentNo);
    Optional<Payment> findByOrderId(Long orderId);
}
