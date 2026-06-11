package com.goldenmonkey.adoption.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "adoption_order")
public class AdoptionOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", nullable = false, unique = true, length = 64)
    private String orderNo;

    @Column(name = "monkey_id", nullable = false)
    private Long monkeyId;

    @Column(name = "tier_id", nullable = false)
    private Long tierId;

    @Column(name = "adopter_name", length = 100)
    private String adopterName;

    @Column(name = "adopter_email", length = 100)
    private String adopterEmail;

    @Column(name = "adopter_phone", length = 20)
    private String adopterPhone;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "certificate_id")
    private Long certificateId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
