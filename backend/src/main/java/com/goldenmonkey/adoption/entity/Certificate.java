package com.goldenmonkey.adoption.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "certificate")
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "certificate_no", nullable = false, unique = true, length = 64)
    private String certificateNo;

    @Column(name = "adopter_display_name", length = 100)
    private String adopterDisplayName;

    @Column(name = "monkey_name", length = 100)
    private String monkeyName;

    @Column(name = "tier_name", length = 100)
    private String tierName;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "pdf_content")
    @Lob
    private byte[] pdfContent;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
