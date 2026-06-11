# 川金丝猴认养公益平台

一个基于 **Spring Boot 3 + React 18** 的完整公益项目，用于川金丝猴在线认养。

## 功能特性

- 🐒 **金丝猴个体展示**：展示每只川金丝猴的照片、故事、性格、栖息地等详细信息
- 💚 **认养档位选择**：4个认养档位（爱心守护/成长伙伴/守护大使/终身守护者）
- 🛒 **购物车式认养**：可将多只金丝猴加入认养篮统一结算
- 💳 **模拟支付流程**：内置模拟支付回调，无需对接真实支付通道
- 📄 **PDF电子证书**：后端使用 iText 8 自动生成认养证书（支持中文）
- 🔒 **隐私保护**：公开页面认养人姓名自动脱敏（如：张*三），不泄露真实信息
- 🏷️ **已认养徽章**：被认养的金丝猴在列表页和详情页显示"已认养"徽章

## 技术栈

| 模块 | 技术 |
|------|------|
| 后端 | Spring Boot 3.2 + Spring Data JPA + MySQL 8.0 |
| PDF生成 | iText 8 (kernel + layout + io) |
| 前端 | React 18 + React Router 6 + Vite 5 + Axios |
| 部署 | Docker Compose + Nginx |

## 快速开始

### 方式一：Docker Compose 一键启动

```bash
# 在项目根目录执行
docker-compose up -d
```

启动完成后访问：
- 前端: http://localhost:3000
- 后端API: http://localhost:8080/api/health

### 方式二：本地开发

**1. 启动 MySQL**
```bash
docker run -d --name gm-mysql \
  -e MYSQL_ROOT_PASSWORD=root123456 \
  -e MYSQL_DATABASE=golden_monkey \
  -e MYSQL_USER=monkey_user \
  -e MYSQL_PASSWORD=monkey_pass123 \
  -p 3306:3306 mysql:8.0
```

**2. 启动后端**
```bash
cd backend
mvn spring-boot:run
```

**3. 启动前端**
```bash
cd frontend
npm install
npm run dev
```

## 项目结构

```
tl-0033-1/
├── backend/                          # Spring Boot 后端
│   ├── src/main/java/com/goldenmonkey/adoption/
│   │   ├── AdoptionApplication.java  # 启动类
│   │   ├── common/                   # 公共类（统一响应）
│   │   ├── config/                   # 配置类（CORS等）
│   │   ├── controller/               # REST API 控制器
│   │   ├── dto/                      # 请求/响应 DTO
│   │   ├── entity/                   # JPA 实体类
│   │   ├── exception/                # 全局异常处理
│   │   ├── repository/               # JPA Repository
│   │   └── service/                  # 业务逻辑层
│   ├── src/main/resources/
│   │   ├── application.yml           # 应用配置
│   │   ├── schema.sql                # 数据库建表脚本
│   │   └── data.sql                  # 初始化数据
│   └── Dockerfile
├── frontend/                         # React 前端
│   ├── src/
│   │   ├── api/                      # Axios API 封装
│   │   ├── components/               # 公共组件
│   │   ├── context/                  # React Context（购物车状态）
│   │   ├── pages/                    # 页面组件
│   │   └── styles/                   # 全局样式
│   ├── Dockerfile
│   └── nginx.conf
├── docs/
│   ├── API.md                        # 接口文档
│   └── CERTIFICATE.md                # 证书模板字段说明
└── docker-compose.yml
```

## 使用流程

1. 浏览首页 → 选择一只可认养的川金丝猴
2. 进入详情页 → 查看个体故事、选择认养档位
3. 加入认养篮 → 填写认养人信息 → 确认支付
4. 模拟支付成功 → 自动生成电子证书 → 查看/下载 PDF 证书

## 接口文档

详见 [docs/API.md](docs/API.md)

## 证书模板说明

详见 [docs/CERTIFICATE.md](docs/CERTIFICATE.md)
