package com.goldenmonkey.adoption.repository;

import com.goldenmonkey.adoption.entity.AdoptionOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdoptionOrderRepository extends JpaRepository<AdoptionOrder, Long> {
    Optional<AdoptionOrder> findByOrderNo(String orderNo);
    Optional<AdoptionOrder> findByMonkeyIdAndStatusIn(Long monkeyId, java.util.List<String> statuses);
    boolean existsByAdopterEmailAndMonkeyIdAndStatus(String adopterEmail, Long monkeyId, String status);
}
