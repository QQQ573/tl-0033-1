package com.goldenmonkey.adoption.service;

import com.goldenmonkey.adoption.dto.GrowthDiaryVO;
import com.goldenmonkey.adoption.entity.GrowthDiary;
import com.goldenmonkey.adoption.entity.Monkey;
import com.goldenmonkey.adoption.repository.AdoptionOrderRepository;
import com.goldenmonkey.adoption.repository.GrowthDiaryRepository;
import com.goldenmonkey.adoption.repository.MonkeyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GrowthDiaryService {

    @Autowired
    private GrowthDiaryRepository diaryRepository;

    @Autowired
    private MonkeyRepository monkeyRepository;

    @Autowired
    private AdoptionOrderRepository orderRepository;

    public Map<String, Object> getDiariesByMonkeyId(Long monkeyId, String userEmail) {
        Map<String, Object> result = new HashMap<>();

        List<GrowthDiary> allDiaries = diaryRepository.findByMonkeyIdOrderByRecordDateDesc(monkeyId);
        if (allDiaries.isEmpty()) {
            result.put("isFullAccess", false);
            result.put("diaries", new ArrayList<>());
            result.put("total", 0);
            return result;
        }

        boolean hasFullAccess = false;
        if (StringUtils.hasText(userEmail)) {
            hasFullAccess = orderRepository.existsByAdopterEmailAndMonkeyIdAndStatus(
                    userEmail.trim(), monkeyId, "COMPLETED");
        }

        result.put("isFullAccess", hasFullAccess);
        result.put("total", allDiaries.size());

        Optional<Monkey> monkeyOpt = monkeyRepository.findById(monkeyId);
        String monkeyName = monkeyOpt.map(Monkey::getName).orElse(null);

        List<GrowthDiary> diariesToReturn;
        boolean isSummary;

        if (hasFullAccess) {
            diariesToReturn = allDiaries;
            isSummary = false;
        } else {
            diariesToReturn = allDiaries.subList(0, 1);
            isSummary = true;
        }

        List<GrowthDiaryVO> voList = diariesToReturn.stream()
                .map(d -> {
                    GrowthDiaryVO vo = GrowthDiaryVO.fromEntity(d, isSummary);
                    if (monkeyName != null) {
                        vo.setMonkeyName(monkeyName);
                    }
                    return vo;
                })
                .collect(Collectors.toList());

        result.put("diaries", voList);
        return result;
    }

    public List<GrowthDiaryVO> getLatestDiaries(int limit) {
        List<GrowthDiary> diaries = diaryRepository.findLatest(PageRequest.of(0, limit));
        Map<Long, String> monkeyNameMap = new HashMap<>();

        return diaries.stream()
                .map(d -> {
                    GrowthDiaryVO vo = GrowthDiaryVO.fromEntity(d, false);
                    String monkeyName = monkeyNameMap.computeIfAbsent(
                            d.getMonkeyId(),
                            id -> monkeyRepository.findById(id).map(Monkey::getName).orElse(null)
                    );
                    vo.setMonkeyName(monkeyName);
                    return vo;
                })
                .collect(Collectors.toList());
    }
}
