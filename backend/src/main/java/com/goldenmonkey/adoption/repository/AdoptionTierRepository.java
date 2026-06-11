package com.goldenmonkey.adoption.repository;

import com.goldenmonkey.adoption.entity.AdoptionTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdoptionTierRepository extends JpaRepository<AdoptionTier, Long> {
    List<AdoptionTier> findByIsActiveTrueOrderBySortOrderAsc();
    Optional<AdoptionTier> findByCode(String code);
}
