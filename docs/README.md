# Reals Platform Documentation Portal

Chào mừng bạn đến với trung tâm tài liệu kỹ thuật của **Reals Platform** — Hệ sinh thái mạng xã hội, đa phương tiện và nền tảng đọc truyện chữ/tiểu thuyết trực tuyến kiến trúc vi dịch vụ (Microservices Architecture).

Thư mục này được tổ chức thành 4 phân khu tài liệu chính, phục vụ các nhà phát triển và các autonomous AI coding agents:

```
docs/
├── architecture/       # Kiến trúc tổng thể, sơ đồ kết nối và snapshots dịch vụ
├── schemas/            # Cấu trúc cơ sở dữ liệu (Prisma), Data contracts và Events
├── skills/             # Tài liệu thiết kế phân hệ nghiệp vụ, UI/UX và recipes
└── specs/              # Quy chuẩn API, Single Envelope, Phân trang và Bảo mật
```

---

## 1. Sơ Đồ Điều Hướng Tài Liệu (Navigation Map)

### 🏗️ [1. Kiến Trúc Hệ Thống (Architecture)](./architecture/README.md)
Tổng quan kiến trúc toàn bộ hệ sinh thái, ranh giới dịch vụ và nguyên tắc thiết kế:
- [**Bản Đồ Kiến Trúc Hệ Thống**](./architecture/README.md)
- [**API Gateway Architecture**](./architecture/gateway-architecture.md) (`services/gateway`)
- [**IAM Service Architecture**](./architecture/iam-service-architecture.md) (`services/iam-service`)
- [**IAM Web Client Architecture**](./architecture/iam-web-client-architecture.md) (`frontend/iam-web-client`)
- [**Stories Service Architecture**](./architecture/stories-service-snapshot.md) (`services/stories-service`)
- [**Stories Web Client Architecture**](./architecture/stories-web-client-snapshot.md) (`frontend/stories-web-client`)

### 🗄️ [2. Cơ Sở Dữ Liệu & Hợp Đồng Dữ Liệu (Schemas)](./schemas/README.md)
Đặc tả mô hình dữ liệu, cơ chế Database-per-Service và hợp đồng sự kiện:
- [**Danh mục Database & Migration Rules**](./schemas/README.md#1-cơ-sở-dữ-liệu-theo-dịch-vụ-database-per-service)
- [**Event Contracts & Inter-service Bus**](./schemas/README.md#2-event-contracts--domain-events)

### 📚 [3. Kỹ Năng Nghiệp Vụ & Thiết Kế Phân Hệ (Skills)](./skills/README.md)
Hướng dẫn chi tiết từng module và công nghệ phục vụ implement tính năng:
- [**Phân Hệ Stories / Novel Reading**](./skills/stories/reading-service-design.md): 20 backend modules, luồng đọc truyện, ví tiền & thanh toán.
- [**Chuẩn Prisma Schema cho Stories**](./skills/stories/schema.prisma): 55 models quan hệ toàn diện.
- [**Phân Hệ Authentication & SSO**](./skills/auth/target-architecture-plan.md): Lộ trình MFA, session rotation và bảo mật.
- [**IAM Landing Page Specification**](./skills/auth/landing-page.md): Hướng dẫn thiết kế frontend landing portal.
- [**Portfolio Developer Specs**](./skills/portfolio/portfolio_uiux.md): Hướng dẫn thiết kế trang showcase cá nhân.

### 📋 [4. Quy Chuẩn Kỹ Thuật & API (Specifications)](./specs/README.md)
Các tiêu chuẩn bắt buộc khi xây dựng API mới:
- [**Chuẩn Hóa Cấu Trúc Single Envelope**](./specs/README.md#1-chuẩn-hóa-cấu-trúc-phản-hồi-single-envelope-standard)
- [**Quy Chuẩn Phân Trang (Pagination)**](./specs/README.md#2-quy-chuẩn-phân-trang-pagination-convention)
- [**Quy Chuẩn Bảo Mật & RBAC**](./specs/README.md#3-xác-thực--ủy-quyền-authentication--security)
- [**Danh Mục Swagger UI**](./specs/README.md#4-openapi--swagger-documentation)

---

## 2. Hướng Dẫn Khởi Chạy Môi Trường Local (Quick Start)

Toàn bộ hạ tầng phụ trợ (Databases, Redis, MinIO, Jaeger) đã được cấu hình sẵn trong file `docker-compose.yml` ở thư mục gốc.

### Bước 1: Khởi động Hạ tầng Docker
```bash
# Khởi động toàn bộ cơ sở dữ liệu, Redis và Storage
docker compose up -d iam-postgres media-postgres social-postgres stories-postgres redis minio jaeger
```

### Bước 2: Chuẩn bị Biến Môi Trường (Environment Variables)
Tất cả các dịch vụ đều có file `.env.example` chuẩn:
- Root: `.env.example` -> `.env`
- Services: `services/<service-name>/.env.example` -> `services/<service-name>/.env`

### Bước 3: Build các Thư viện Nền tảng (Platform SDKs)
Trước khi chạy bất kỳ backend hay frontend nào, build các shared platform packages:
```bash
cd platform
npm install
npm run build
```

### Bước 4: Khởi Chạy Microservice Cụ Thể (Ví dụ Stories Service)
```bash
cd services/stories-service

# 1. Cài đặt dependencies
npm install

# 2. Sinh Prisma Client chuyên biệt
npx prisma generate

# 3. Đồng bộ cơ sở dữ liệu (tự động tạo 55 bảng)
npx prisma db push

# 4. Khởi chạy ở chế độ Development
npm run start:dev
```

---

## 3. Bản Đồ Phân Bổ Cổng (Port Mapping Matrix)

| Thành phần | Loại | Cổng Host (Local) | Ghi chú |
|---|---|---|---|
| **API Gateway** | Backend | `3000` | Edge Router công khai cho toàn hệ thống |
| **IAM Service** | Backend | `3001` | Dịch vụ định danh, xác thực & phân quyền |
| **Media Service** | Backend | `3003` | Dịch vụ xử lý & lưu trữ file |
| **Social Service** | Backend | `3004` | Dịch vụ mạng xã hội, bài viết & tương tác |
| **Stories Service** | Backend | `3005` | Nền tảng đọc truyện chữ / tiểu thuyết |
| **IAM Web Client** | Frontend | `4204` | SSO Portal & Ecosystem Showcase |
| **Social Web Client** | Frontend | `4200` | Giao diện mạng xã hội |
| **Video Web Client** | Frontend | `4201` | Giao diện xem video / reels |
| **Shop Web Client** | Frontend | `4202` | Giao diện thương mại điện tử |
| **Stories Web Client** | Frontend | `4203` | Giao diện đọc truyện & Studio tác giả |
| **Portfolio Client** | Frontend | `4205` | Trang portfolio cá nhân |
| **IAM PostgreSQL** | Infrastructure | `5433` | Database `iam_db` |
| **Media PostgreSQL** | Infrastructure | `5434` | Database `media_db` |
| **Social PostgreSQL** | Infrastructure | `5435` | Database `social_db` |
| **Stories PostgreSQL** | Infrastructure | `5436` | Database `stories_db` |
| **Redis** | Infrastructure | `6379` | Cache, Pub/Sub EventBus, OTP |
| **MinIO S3 API / Console**| Infrastructure | `9000` / `9001` | Object storage cho media & ảnh bìa |
| **Jaeger Tracing** | Infrastructure | `16686` | Dashboard truy vết OpenTelemetry |

---

## 4. Nguyên Tắc Cho AI Coding Agents
1. Khi phát triển tính năng mới: Tham chiếu thiết kế tại [docs/skills/](./skills/README.md).
2. Khi chỉnh sửa hoặc tạo API: Tuân thủ [Single Envelope Standard](./specs/README.md).
3. Luôn đảm bảo unit tests và build passes trước khi hoàn thành task.
