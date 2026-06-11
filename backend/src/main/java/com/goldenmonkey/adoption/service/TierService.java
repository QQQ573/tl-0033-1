package com.goldenmonkey.adoption.service;

import com.goldenmonkey.adoption.dto.TierVO;
import com.goldenmonkey.adoption.entity.AdoptionTier;
import com.goldenmonkey.adoption.repository.AdoptionTierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TierService {

    @Autowired
    private AdoptionTierRepository tierRepository;

    public List<TierVO> getAllActiveTiers() {
        return tierRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    public Optional<AdoptionTier> getTierById(Long id) {
        return tierRepository.findById(id);
    }

    public Optional<TierVO> getTierVOById(Long id) {
        return tierRepository.findById(id).map(this::convertToVO);
    }

    private TierVO convertToVO(AdoptionTier tier) {
        TierVO vo = new TierVO();
        vo.setId(tier.getId());
        vo.setName(tier.getName());
        vo.setCode(tier.getCode());
        vo.setPrice(tier.getPrice());
        vo.setDurationMonths(tier.getDurationMonths());
        vo.setDescription(tier.getDescription());
        vo.setBenefits(tier.getBenefits());
        vo.setBadgeImageUrl(tier.getBadgeImageUrl());
        vo.setSortOrder(tier.getSortOrder());
        return vo;
    }
}
