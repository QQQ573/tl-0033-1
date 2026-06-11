package com.goldenmonkey.adoption.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateOrderRequest {

    @NotNull(message = "请选择金丝猴")
    private Long monkeyId;

    @NotNull(message = "请选择认养档位")
    private Long tierId;

    @NotBlank(message = "请填写认养人姓名")
    @Size(max = 100, message = "姓名长度不能超过100个字符")
    private String adopterName;

    @Email(message = "请填写有效的邮箱地址")
    @Size(max = 100, message = "邮箱长度不能超过100个字符")
    private String adopterEmail;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "请填写有效的手机号码", flags = {Pattern.Flag.CASE_INSENSITIVE})
    private String adopterPhone;

    @Size(max = 500, message = "留言长度不能超过500个字符")
    private String message;

    @Size(max = 50, message = "显示名称长度不能超过50个字符")
    private String displayName;
}
