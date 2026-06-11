package com.goldenmonkey.adoption.controller;

import com.goldenmonkey.adoption.common.Result;
import com.goldenmonkey.adoption.dto.TierVO;
import com.goldenmonkey.adoption.service.TierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tiers")
public class TierController {

    @Autowired
    private TierService tierService;

    @GetMapping
    public Result<List<TierVO>> list() {
        return Result.success(tierService.getAllActiveTiers());
    }

    @GetMapping("/{id}")
    public Result<TierVO> getById(@PathVariable Long id) {
        return tierService.getTierVOById(id)
                .map(Result::success)
                .orElse(Result.notFound("认养档位不存在"));
    }
}
