# Reals Platform Documentation Portal

Chào mừng bạn đến với trung tâm tài liệu kỹ thuật của **Reals Platform** — Hệ sinh thái mạng xã hội, đa phương tiện và nền tảng đọc truyện chữ/tiểu thuyết trực tuyến kiến trúc vi dịch vụ (Microservices Architecture).

Tài liệu dự án có một cây chuẩn dưới `docs/`; agent workflow skills nằm riêng trong `.agents/skills/`:

```
docs/
├── architecture/       # Quyết định kiến trúc và kế hoạch liên repo
├── domain-guides/      # Thiết kế nghiệp vụ/UI và tài liệu tham khảo theo domain
├── schemas/            # Database schemas, data contracts và events
└── specs/              # Quy ước API, pagination và bảo mật

.agents/skills/         # Agent workflows, mỗi skill có SKILL.md
```

---

## 1. Sơ Đồ Điều Hướng Tài Liệu

### 🏗️ [1. Kiến Trúc Hệ Thống](./architecture/README.md)
Architecture records, target decisions và kế hoạch đồng bộ nằm trong một cây tài liệu duy nhất.
- [**SSO & Target Architecture**](./architecture/auth-sso-target-plan.md)
- [**Platform Backend Plan**](./architecture/platform-backend-plan.md)
- [**Platform Frontend Plan**](./architecture/platform-frontend-plan.md)
- [**Shared Contracts Plan**](./architecture/shared-contracts-plan.md)
- [**Implementation Sync & Cleanup Plan**](./architecture/implementation-sync-cleanup-plan.md)

### 🗄️ [2. Cơ Sở Dữ Liệu & Hợp Đồng Dữ Liệu](./schemas/README.md)
Đặc tả mô hình dữ liệu, cơ chế Database-per-Service và hợp đồng sự kiện:
- [**Danh mục Database & Migration Rules**](./schemas/README.md#1-cơ-sở-dữ-liệu-theo-dịch-vụ-database-per-service)
- [**Event Contracts & Inter-service Bus**](./schemas/README.md#2-event-contracts--domain-events)

### 📚 [3. Domain Guides](./domain-guides/README.md)
Tài liệu thiết kế nghiệp vụ và trải nghiệm sản phẩm; đây không phải nơi đặt agent workflow skills:
- [**Stories / Novel Reading Design**](./domain-guides/stories/reading-service-design.md)
- [**Stories Database Blueprint**](./domain-guides/stories/schema.prisma)
- [**Portfolio UI/UX**](./domain-guides/portfolio/portfolio_uiux.md)
- [**Portfolio Content**](./domain-guides/portfolio/portfolio_content.md)

### 📋 [4. Quy Chuẩn Kỹ Thuật & API](./specs/README.md)
Các chuẩn API và bảo mật; giữ tương thích response cũ trong lúc consumer migrate:
- [**Response Contracts & Migration**](./specs/README.md#1-chuẩn-hóa-cấu-trúc-phản-hồi-single-envelope-standard)
- [**Quy Chuẩn Phân Trang (Pagination)**](./specs/README.md#2-quy-chuẩn-phân-trang-pagination-convention)
- [**Quy Chuẩn Bảo Mật & RBAC**](./specs/README.md#3-xác-thực--ủy-quyền-authentication--security)
- [**Danh Mục Swagger UI**](./specs/README.md#4-openapi--swagger-documentation)

### 🤖 [5. Agent Workflow Skills](../.agents/skills/README.md)
Các workflow dùng theo nhu cầu được đặt ở `.agents/skills/<name>/SKILL.md`; không trộn chúng với domain design docs.

---

## 2. Hướng Dẫn Khởi Chạy Môi Trường Local (Quick Start)

Toàn bộ hạ tầng phụ trợ (Databases, Redis, MinIO, Jaeger) đã được cấu hình sẵn trong file `docker-compose.yml` ở thư mục gốc.

### Bước 1: Khởi động Hạ tầng Docker
```bash
# Khởi động infrastructure gồm databases, Redis, storage, tracing và Keycloak
npm run docker:infra:up
```

### Bước 2: Chuẩn bị Biến Môi Trường (Environment Variables)
Tất cả các dịch vụ đều có file `.env.example` chuẩn:
- Root: `.env.example` -> `.env`
- Services: `services/<service-name>/.env.example` -> `services/<service-name>/.env`

### Bước 3: Build thư viện nền tảng khi cần
Chạy trong repository package tương ứng khi thay đổi package hoặc kiểm tra local:
```bash
cd platform
pnpm install
pnpm build

cd ../platform-frontend
pnpm install
pnpm build
```

### Bước 4: Khởi Chạy Microservice Cụ Thể (Ví dụ Stories Service)
```bash
cd services/stories-service

# 1. Cài đặt dependencies
npm install

# 2. Sinh Prisma Client
npx prisma generate

# 3. Áp dụng schema theo migration/workflow đã chọn cho môi trường
npx prisma db push

# 4. Khởi chạy ở chế độ Development
npm run dev
```

---

## 3. Bản Đồ Phân Bổ Cổng (Port Mapping Matrix)

| Thành phần | Loại | Cổng Host (Local) | Ghi chú |
|---|---|---|---|
| **API Gateway** | Backend | `3000` | Edge Router công khai cho toàn hệ thống |
| **IAM Service** | Backend | `3001` | Profile nghiệp vụ theo Keycloak `sub` |
| **Social Service** | Backend | `3002` | Dịch vụ mạng xã hội, bài viết & tương tác |
| **Media Service** | Backend | `3003` | Dịch vụ xử lý & lưu trữ file |
| **Stories Service** | Backend | `3004` | Nền tảng đọc truyện chữ / tiểu thuyết |
| **IAM Web Client** | Frontend | `4200` | SSO Portal & Ecosystem Showcase |
| **Social Web Client** | Frontend | `4201` | Giao diện mạng xã hội |
| **Video Web Client** | Frontend | `4202` | Giao diện xem video / reels |
| **Shop Web Client** | Frontend | `4203` | Giao diện thương mại điện tử |
| **Stories Web Client** | Frontend | `4204` | Giao diện đọc truyện & Studio tác giả |
| **Portfolio Client** | Frontend | `4205` | Trang portfolio cá nhân |
| **IAM PostgreSQL** | Infrastructure | `5432` | Database `iam_db` |
| **Social PostgreSQL** | Infrastructure | `5433` | Database `social_db` |
| **Media PostgreSQL** | Infrastructure | `5434` | Database `media_db` |
| **Stories PostgreSQL** | Infrastructure | `5435` | Database `stories_db` |
| **Redis** | Infrastructure | `6379` | BFF sessions, queues and event transport |
| **MinIO S3 API / Console**| Infrastructure | `9000` / `9001` | Object storage cho media & ảnh bìa |
| **Jaeger Tracing** | Infrastructure | `16686` | Dashboard truy vết OpenTelemetry |

---

## 4. Nguyên Tắc Cho AI Coding Agents
1. Khi phát triển tính năng mới: Tham chiếu thiết kế nghiệp vụ tại [docs/domain-guides/](./domain-guides/README.md).
2. Khi chỉnh sửa API: Dùng shared contracts; duy trì backward compatibility theo [API specs](./specs/README.md).
3. Luôn đảm bảo unit tests và build passes trước khi hoàn thành task.
