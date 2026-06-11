package com.goldenmonkey.adoption.controller;

import com.goldenmonkey.adoption.common.Result;
import com.goldenmonkey.adoption.dto.MonkeyDetailVO;
import com.goldenmonkey.adoption.service.MonkeyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/monkeys")
public class MonkeyController {

    @Autowired
    private MonkeyService monkeyService;

    @GetMapping
    public Result<List<MonkeyDetailVO>> list() {
        return Result.success(monkeyService.getAllMonkeys());
    }

    @GetMapping("/available")
    public Result<List<MonkeyDetailVO>> listAvailable() {
        return Result.success(monkeyService.getAvailableMonkeys());
    }

    @GetMapping("/{id}")
    public Result<MonkeyDetailVO> getById(@PathVariable Long id) {
        return monkeyService.getMonkeyById(id)
                .map(Result::success)
                .orElse(Result.notFound("金丝猴不存在"));
    }
}
