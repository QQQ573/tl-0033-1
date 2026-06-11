# 川金丝猴认养公益平台 - 接口文档

## 基础信息

- **Base URL**: `/api`
- **Content-Type**: `application/json`
- **响应格式**: 统一响应体

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

| code | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 一、金丝猴接口

### 1.1 获取金丝猴列表

- **URL**: `GET /api/monkeys`
- **描述**: 获取所有金丝猴个体（含已认养）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "毛毛",
      "code": "GM-2021-001",
      "gender": "雄性",
      "age": 5,
      "healthStatus": "健康",
      "habitat": "四川卧龙国家级自然保护区",
      "personality": "活泼好动",
      "story": "毛毛出生于2020年春天...",
      "imageUrl": "https://...",
      "isAdopted": false,
      "createdAt": "2026-01-01T00:00:00"
    }
  ]
}
```

### 1.2 获取可认养金丝猴列表

- **URL**: `GET /api/monkeys/available`
- **描述**: 仅返回未被认养的金丝猴

### 1.3 获取金丝猴详情

- **URL**: `GET /api/monkeys/{id}`
- **参数**: `id` - 金丝猴ID（路径参数）

---

## 二、认养档位接口

### 2.1 获取所有档位

- **URL**: `GET /api/tiers`
- **描述**: 获取所有启用的认养档位

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "爱心守护",
      "code": "TIER_BASIC",
      "price": 99.00,
      "durationMonths": 1,
      "description": "每月捐赠99元...",
      "benefits": "1. 专属电子认养证书\n2. ...",
      "badgeImageUrl": "/badges/tier-basic.png",
      "sortOrder": 1
    }
  ]
}
```

### 2.2 获取档位详情

- **URL**: `GET /api/tiers/{id}`

---

## 三、订单接口

### 3.1 创建认养订单

- **URL**: `POST /api/orders`

**请求体**:
```json
{
  "monkeyId": 1,
  "tierId": 1,
  "adopterName": "张三",
  "adopterEmail": "zhangsan@example.com",
  "adopterPhone": "13800138000",
  "message": "希望你健康快乐成长！",
  "displayName": "爱心人士"
}
```

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| monkeyId | ✅ | Long | 金丝猴ID |
| tierId | ✅ | Long | 认养档位ID |
| adopterName | ✅ | String | 认养人真实姓名（最多100字） |
| adopterEmail | ❌ | String | 邮箱（用于接收通知） |
| adopterPhone | ❌ | String | 手机号（11位） |
| message | ❌ | String | 给金丝猴的寄语（最多500字） |
| displayName | ❌ | String | 公开显示名称（默认脱敏真实姓名） |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "orderNo": "GM20260611143052A1B2C3D4",
    "monkeyId": 1,
    "monkeyName": "毛毛",
    "monkeyImageUrl": "https://...",
    "tierId": 1,
    "tierName": "爱心守护",
    "totalAmount": 99.00,
    "status": "PENDING",
    "createdAt": "2026-06-11T14:30:52",
    "updatedAt": "2026-06-11T14:30:52"
  }
}
```

**订单状态**:
| status | 说明 |
|--------|------|
| PENDING | 待支付 |
| COMPLETED | 已完成 |
| FAILED | 失败 |

### 3.2 查询订单

- **URL**: `GET /api/orders/{orderNo}`
- **参数**: `orderNo` - 订单号（路径参数）

---

## 四、支付接口

### 4.1 模拟支付成功

- **URL**: `POST /api/payment/simulate/{orderNo}`
- **描述**: 模拟支付网关回调，将订单标记为支付成功，自动生成证书
- **参数**: `orderNo` - 订单号（路径参数）

**响应示例**:
```json
{
  "code": 200,
  "message": "模拟支付成功",
  "data": {
    "paymentNo": "PAY20260611143052A1B2C3D4E5F6",
    "status": "SUCCESS",
    "paidAt": "2026-06-11T14:32:10",
    "transactionId": "SIMA1B2C3D4E5F6789012"
  }
}
```

### 4.2 支付回调接口

- **URL**: `POST /api/payment/callback`
- **描述**: 接收支付网关回调通知（生产环境使用）

**请求体**:
```json
{
  "paymentNo": "PAY20260611143052A1B2C3D4E5F6",
  "orderNo": "GM20260611143052A1B2C3D4",
  "amount": 99.00,
  "status": "SUCCESS",
  "transactionId": "wx20260611...",
  "paymentMethod": "wechat"
}
```

### 4.3 查询支付记录

- **URL**: `GET /api/payment/{paymentNo}`

---

## 五、证书接口

### 5.1 查询证书信息

- **URL**: `GET /api/certificates/{certificateNo}`

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "certificateNo": "CERT20260611A1B2C3D4E5F6",
    "adopterDisplayName": "张*三",
    "monkeyName": "毛毛",
    "tierName": "爱心守护",
    "startDate": "2026-06-11",
    "endDate": "2026-07-11",
    "issuedAt": "2026-06-11T14:32:10"
  }
}
```

### 5.2 预览证书PDF

- **URL**: `GET /api/certificates/{certificateNo}/view`
- **响应**: `application/pdf` 文件流，可内嵌于 iframe 预览

### 5.3 下载证书PDF

- **URL**: `GET /api/certificates/{certificateNo}/download`
- **响应**: `application/pdf` 文件下载流，Content-Disposition: attachment

---

## 六、健康检查

### 6.1 服务健康检查

- **URL**: `GET /api/health`
