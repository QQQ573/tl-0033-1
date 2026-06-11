package com.goldenmonkey.adoption.controller;

import com.goldenmonkey.adoption.common.Result;
import com.goldenmonkey.adoption.dto.CreateOrderRequest;
import com.goldenmonkey.adoption.dto.OrderVO;
import com.goldenmonkey.adoption.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public Result<OrderVO> create(@Valid @RequestBody CreateOrderRequest request) {
        try {
            return Result.success(orderService.createOrder(request));
        } catch (IllegalArgumentException e) {
            return Result.badRequest(e.getMessage());
        }
    }

    @GetMapping("/{orderNo}")
    public Result<OrderVO> getByOrderNo(@PathVariable String orderNo) {
        return orderService.getOrderByOrderNo(orderNo)
                .map(Result::success)
                .orElse(Result.notFound("订单不存在"));
    }
}
