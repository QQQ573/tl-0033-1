package com.goldenmonkey.adoption.dto;

import com.goldenmonkey.adoption.entity.GrowthDiary;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GrowthDiaryVO {
    private Long id;
    private Long monkeyId;
    private String monkeyName;
    private LocalDate recordDate;
    private String title;
    private String content;
    private BigDecimal weightKg;
    private String moodTag;
    private String imageUrl;
    private String keeperName;
    private Boolean isSummary;

    public static GrowthDiaryVO fromEntity(GrowthDiary entity, boolean isSummary) {
        GrowthDiaryVO vo = new GrowthDiaryVO();
        vo.setId(entity.getId());
        vo.setMonkeyId(entity.getMonkeyId());
        vo.setRecordDate(entity.getRecordDate());
        vo.setTitle(entity.getTitle());
        vo.setIsSummary(isSummary);
        if (!isSummary) {
            vo.setContent(entity.getContent());
            vo.setWeightKg(entity.getWeightKg());
            vo.setMoodTag(entity.getMoodTag());
            vo.setImageUrl(entity.getImageUrl());
            vo.setKeeperName(entity.getKeeperName());
        }
        return vo;
    }
}
