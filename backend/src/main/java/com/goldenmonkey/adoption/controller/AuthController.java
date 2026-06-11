package com.goldenmonkey.adoption.controller;

import com.goldenmonkey.adoption.common.Result;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.Data;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Data
    public static class LoginRequest {
        private String email;
        private String name;
    }

    @PostMapping("/login")
    public Result<Map<String, Object>> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        if (!StringUtils.hasText(request.getEmail())) {
            return Result.error("请输入邮箱");
        }
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute("userEmail", request.getEmail().trim());
        if (StringUtils.hasText(request.getName())) {
            session.setAttribute("userName", request.getName().trim());
        }

        Map<String, Object> user = new HashMap<>();
        user.put("email", session.getAttribute("userEmail"));
        user.put("name", session.getAttribute("userName"));
        return Result.success(user);
    }

    @GetMapping("/me")
    public Result<Map<String, Object>> getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return Result.success(null);
        }
        String email = (String) session.getAttribute("userEmail");
        if (email == null) {
            return Result.success(null);
        }
        Map<String, Object> user = new HashMap<>();
        user.put("email", email);
        user.put("name", session.getAttribute("userName"));
        return Result.success(user);
    }

    @PostMapping("/logout")
    public Result<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return Result.success(null);
    }
}
