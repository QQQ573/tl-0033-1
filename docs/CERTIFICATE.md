# 川金丝猴认养证书 - 模板字段说明

## 一、证书概述

认养成功后，系统自动使用 **iText 8** 生成 PDF 电子认养证书。证书存储于数据库的 `certificate.pdf_content` 字段（LONGBLOB 二进制），同时生成唯一证书编号。

**生成逻辑位置**:
- Service: [CertificateService.java](file:///c:/Users/benzhi/Desktop/solo0611/项目/tl-0033-1/backend/src/main/java/com/goldenmonkey/adoption/service/CertificateService.java)

---

## 二、证书字段说明

| 字段名 | 数据库列 | 类型 | 说明 |
|--------|----------|------|------|
| 证书编号 | `certificate_no` | VARCHAR(64) | 唯一标识，格式 `CERT + yyyyMMdd + 12位UUID` |
| 关联订单 | `order_id` | BIGINT | 外键，关联 `adoption_order.id` |
| 认养人显示名 | `adopter_display_name` | VARCHAR(100) | **脱敏显示**，见下方脱敏规则 |
| 金丝猴名称 | `monkey_name` | VARCHAR(100) | 被认养的金丝猴名字 |
| 档位名称 | `tier_name` | VARCHAR(100) | 认养档位名称（如"爱心守护"） |
| 认养开始日期 | `start_date` | DATE | 认养生效日期（支付成功当日） |
| 认养结束日期 | `end_date` | DATE | `start_date + tier.duration_months` |
| 颁发时间 | `issued_at` | TIMESTAMP | 证书生成时间 |
| 文件路径 | `file_path` | VARCHAR(500) | 预留字段，当前为 null（直接存二进制） |
| PDF二进制 | `pdf_content` | LONGBLOB | iText 生成的 PDF 文件二进制内容 |
| 创建时间 | `created_at` | TIMESTAMP | 记录创建时间 |

---

## 三、PDF 证书版面

证书为 A4 尺寸竖版，使用 **STSong-Light** 字体（iText 内置中文支持，编码 `UniGB-UCS2-H`）。

版面结构：

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              川金丝猴认养证书                    │  ← 标题（28pt，居中，加粗）
│                                                     │
│                                   证书编号：CERT... │  ← 右上角（10pt）
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  认养人      │  张*三                          │  │
│  │  认养金丝猴  │  毛毛（编号：GM-2021-001）      │  │  ← 信息表格（两列）
│  │  认养档位    │  爱心守护                        │  │
│  │  认养金额    │  ¥99.00元（1个月）              │  │
│  │  认养期限    │  2026年06月11日 至 ...          │  │
│  │  颁发日期    │  2026年06月11日                 │  │
│  │  认养寄语    │  希望你健康快乐成长！            │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│     感谢您对川金丝猴保护事业的支持与贡献！         │  ← 感谢语（居中）
│     您的爱心将帮助这些可爱的精灵在自然家园中...    │
│                                                     │
│                                            川金丝猴  │
│                                    保护研究中心     │  ← 落款（右对齐）
│                                    2026年06月11日   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 四、认养人姓名脱敏规则

为保护捐赠者隐私，公开展示的姓名按以下规则脱敏：

| 原始姓名 | 脱敏后 | 说明 |
|----------|--------|------|
| (空) | 爱心人士 | 未填写姓名时显示 |
| 张 | 张* | 单字加星号 |
| 张三 | 张* | 双字只保留第一个字 |
| 张三丰 | 张*丰 | 三字保留首末字，中间用星号替代 |
| 欧阳张三丰 | 欧****丰 | 多字保留首末字，其余用星号替代 |

**核心代码**:
```java
private String maskName(String name) {
    if (name == null || name.isEmpty()) return "爱心人士";
    if (name.length() <= 1) return name + "*";
    if (name.length() == 2) return name.charAt(0) + "*";
    StringBuilder sb = new StringBuilder();
    sb.append(name.charAt(0));
    for (int i = 1; i < name.length() - 1; i++) sb.append("*");
    sb.append(name.charAt(name.length() - 1));
    return sb.toString();
}
```

---

## 五、数据库表结构

```sql
CREATE TABLE certificate (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    certificate_no VARCHAR(64) NOT NULL UNIQUE,
    adopter_display_name VARCHAR(100),
    monkey_name VARCHAR(100),
    tier_name VARCHAR(100),
    start_date DATE,
    end_date DATE,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(500),
    pdf_content LONGBLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 六、iText 依赖

```xml
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext-core</artifactId>
    <version>8.0.3</version>
    <type>pom</type>
</dependency>
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>layout</artifactId>
    <version>8.0.3</version>
</dependency>
```
