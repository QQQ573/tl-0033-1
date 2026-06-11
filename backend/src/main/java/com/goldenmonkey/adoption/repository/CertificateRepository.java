package com.goldenmonkey.adoption.repository;

import com.goldenmonkey.adoption.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByCertificateNo(String certificateNo);
    Optional<Certificate> findByOrderId(Long orderId);
}
