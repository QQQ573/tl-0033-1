package com.goldenmonkey.adoption.controller;

import com.goldenmonkey.adoption.common.Result;
import com.goldenmonkey.adoption.dto.GrowthDiaryVO;
import com.goldenmonkey.adoption.service.GrowthDiaryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class GrowthDiaryController {

    @Autowired
    private GrowthDiaryService diaryService;

    @GetMapping("/monkeys/{id}/diaries")
    public Result<Map<String, Object>> getMonkeyDiaries(
            @PathVariable("id") Long monkeyId,
            HttpServletRequest request) {
        String userEmail = (String) request.getSession().getAttribute("userEmail");
        if (userEmail == null) {
            userEmail = request.getHeader("X-User-Email");
        }
        return Result.success(diaryService.getDiariesByMonkeyId(monkeyId, userEmail));
    }

    @GetMapping("/diaries/latest")
    public Result<List<GrowthDiaryVO>> getLatestDiaries(
            @RequestParam(value = "limit", defaultValue = "5") int limit) {
        return Result.success(diaryService.getLatestDiaries(limit));
    }
}
