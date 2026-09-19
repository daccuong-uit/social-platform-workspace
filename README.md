# Reals Platform — Workspace

Workspace trung tâm của **Reals Platform** — nền tảng mạng xã hội đa không gian kiến trúc Microservices + Micro-frontend. Chứa cấu hình Docker Compose cho toàn stack, tài liệu kiến trúc và tất cả submodule.

---

## Kiến trúc tổng quan

```text
                        ┌──────────────────────────────────────────────────────────┐
                        │                FRONTEND CLIENTS  (Angular 21 + Nx)        │
                        │                                                            │
  :4204  fe-iam     ────┤  IAM   – SSO Login & Ecosystem Landing  (iam-web-client)  │
  :4200  fe-social  ────┤  Social – Feeds / Posts / Reels          (social-web-client)│
  :4201  fe-video   ────┤  Video  – Watch / HLS Streaming          (video-web-client) │
  :4202  fe-shop    ────┤  Shop   – Storefront / Cart              (shop-web-client)  │
  :4203  fe-stories ────┤  Stories – Đọc truyện / Author Studio    (stories-web-client)│
  :4205  fe-portfolio───┤  Portfolio – Dev Portfolio (static SPA)  (portfolio-web-client)│
                        └──────────────────────┬───────────────────────────────────┘
                                               │  /api/*  →  nginx reverse proxy
                                               ▼
                                   ┌───────────────────┐
                                   │  gateway  :3000    │  API Gateway (NestJS/Fastify)
                                   │  JWT verify        │  Rate limiting, routing
                                   └─────────┬─────────┘
             ┌─────────────────────┬─────────┴──────────┬───────────────────────┐
             ▼                     ▼                     ▼                       ▼
   iam-service :3001    media-service :3003   social-service :3004   stories-service :3005
   iam_db :5433         media_db :5434        social_db :5435        stories_db :5436
                              │  │                                        │
                        Redis :6379  ←──────── shared ───────────────────┘
                              │
                        media-worker  →  MinIO :9000  (object storage)
                              │
                         jaeger :16686  ←  OTLP traces from all services
```

---

## Danh mục Hạ tầng (Infrastructure Registry)

| Container | Image | Port Host→Internal | Database | User (default) | Password (default) | Volume | Consumers |
|---|---|---|---|---|---|---|---|
| `iam-postgres` | postgres:15-alpine | `5433→5432` | `iam_db` | `iam_admin` | `iam_password` | `iam_postgres_data` | `iam-service` |
| `media-postgres` | postgres:15-alpine | `5434→5432` | `media_db` | `media_admin` | `media_password` | `media_postgres_data` | `media-service` |
| `social-postgres` | postgres:15-alpine | `5435→5432` | `social_db` | `social_admin` | `social_password` | `social_postgres_data` | `social-service` |
| `stories-postgres` | postgres:15-alpine | `5436→5432` | `stories_db` | `stories_admin` | `stories_password` | `stories_postgres_data` | `stories-service` |
| `redis` | redis:7-alpine | `6379→6379` | — | — | `redis_password` | `redis_data` | iam, media, social, stories, media-worker |
| `minio` | minio/minio | `9000→9000` (API), `9001→9001` (Console) | — | `minioadmin` | `minioadmin123` | `minio_data` | `media-service`, `media-worker` |
| `jaeger` | jaegertracing/all-in-one:1.50 | `16686` (UI), `4317` (gRPC), `4318` (HTTP) | — | — | — | — | gateway, iam, media, social, stories |

> **Nguyên lý Database-per-Service**: Mỗi microservice sở hữu đúng 1 database riêng biệt. Không có service nào chia sẻ database với service khác. `stories_db` là database duy nhất cho `stories-service` (biến `STORIES_DATABASE_URL`).

---

## Bảng Port đầy đủ

| Thành phần | Port | URL / Ghi chú |
|---|---|---|
| **fe-social** | 4200 | http://localhost:4200 — Mạng xã hội |
| **fe-video** | 4201 | http://localhost:4201 — Video & Reels |
| **fe-shop** | 4202 | http://localhost:4202 — Storefront |
| **fe-stories** | 4203 | http://localhost:4203 — Đọc truyện |
| **fe-iam** | 4204 | http://localhost:4204 — SSO & Landing |
| **fe-portfolio** | 4205 | http://localhost:4205 — Portfolio |
| **gateway** | 3000 | http://localhost:3000/api/v1/health |
| **iam-service** | 3001 | Internal (accessed via gateway) |
| **media-service** | 3003 | Internal (accessed via gateway) |
| **social-service** | 3004 | Internal (accessed via gateway) |
| **stories-service** | 3005 | Internal (accessed via gateway) |
| **media-worker** | — | No HTTP port (BullMQ consumer only) |
| **iam-postgres** | 5433 | `iam_db` — Creds: iam_admin/iam_password |
| **media-postgres** | 5434 | `media_db` — Creds: media_admin/media_password |
| **social-postgres** | 5435 | `social_db` — Creds: social_admin/social_password |
| **stories-postgres** | 5436 | `stories_db` — Creds: stories_admin/stories_password |
| **redis** | 6379 | Password: redis_password |
| **minio** (API) | 9000 | S3-compatible endpoint |
| **minio** (Console) | 9001 | http://localhost:9001 — minioadmin/minioadmin123 |
| **jaeger** (UI) | 16686 | http://localhost:16686 |
| **jaeger** (OTLP HTTP) | 4318 | Collector endpoint dùng bởi các service |
| **jaeger** (OTLP gRPC) | 4317 | Collector endpoint gRPC |

---

## Khởi động nhanh

### Chạy toàn bộ stack bằng Docker

```powershell
# 1. Chuẩn bị biến môi trường
Copy-Item .env.example .env
# Chỉnh sửa .env nếu cần đổi password/secret

# 2. Khởi động toàn bộ backend (hạ tầng + 6 services)
npm run docker:backend:up

# 3. Khởi động toàn bộ frontend (6 Angular clients)
npm run docker:frontend:up

# 4. Kiểm tra trạng thái
docker compose ps
```

### Chạy local (hạ tầng Docker + services hot-reload)

```powershell
# 1. Chuẩn bị biến môi trường cho từng service
# Mỗi service có .env.example riêng, copy thành .env
Copy-Item services/iam-service/.env.example services/iam-service/.env
Copy-Item services/media-service/.env.example services/media-service/.env
Copy-Item services/social-service/.env.example services/social-service/.env
Copy-Item services/stories-service/.env.example services/stories-service/.env
Copy-Item services/gateway/.env.example services/gateway/.env

# 2. Bật hạ tầng (DB, Redis, MinIO, Jaeger) qua Docker
npm run local:infra:up

# 3. Chạy tất cả backend service cục bộ (hot-reload)
npm run local:backend:up

# 4. Chạy tất cả frontend clients cục bộ (hot-reload)
npm run local:frontend:up
```

---

## Hướng dẫn lệnh vận hành

### Nhóm Docker (`docker:*`)

| Lệnh | Mô tả |
|---|---|
| `docker:backend:up` | Bật hạ tầng + toàn bộ 6 backend services (có build) |
| `docker:backend:down` | Tắt toàn bộ backend + hạ tầng |
| `docker:frontend:up` | Build & bật toàn bộ 6 frontend clients |
| `docker:infra:up` | Chỉ bật 7 thành phần hạ tầng |
| `docker:<service>:up` | Bật 1 service cụ thể, ví dụ: `docker:iam-service:up` |
| `docker:<service>:down` | Tắt 1 service cụ thể |
| `docker:<service>:restart` | Rebuild & restart 1 service |
| `docker:<service>:logs` | Xem logs realtime của 1 service |

**Tên service hợp lệ**: `iam-postgres`, `media-postgres`, `social-postgres`, `stories-postgres`, `redis`, `minio`, `jaeger`, `gateway`, `iam-service`, `media-service`, `social-service`, `stories-service`, `media-worker`, `fe-iam`, `fe-social`, `fe-video`, `fe-shop`, `fe-stories`, `fe-portfolio`

### Nhóm Local (`local:*`)

| Lệnh | Mô tả |
|---|---|
| `local:backend:up` | Bật infra (Docker) + chạy 5 services cục bộ bằng `npm run dev` |
| `local:frontend:up` | Chạy 6 Angular clients cục bộ bằng `nx serve` |
| `local:infra:up/down` | Alias cho `docker:infra:up/down` |
| `local:<service>:up` | Chạy 1 service cục bộ, ví dụ: `local:stories-service:up` |
| `local:<client>:up` | Chạy 1 frontend client cục bộ, ví dụ: `local:fe-stories:up` |

### Git Multi-repo (`repos:*`)

| Lệnh | Mô tả |
|---|---|
| `repos:status` | Xem trạng thái git của tất cả 14 repos |
| `repos:commit` | Stage & commit tất cả repos với message mặc định |
| `repos:push` | Push tất cả repos lên `origin/main` |
| `repos:verify` | Kiểm tra `docker compose config` + `git diff --check` tất cả repos |

---

## Backend Service Repositories

| Repo | Port | Ngôn ngữ | Trách nhiệm | Database |
|---|---|---|---|---|
| `services/gateway` | 3000 | NestJS/Fastify | API Gateway, JWT verify, rate limiting | — |
| `services/iam-service` | 3001 | NestJS/Fastify | Identity, Auth, SSO, MFA, RBAC | `iam_db` |
| `services/media-service` | 3003 | NestJS/Express | Upload, metadata, MinIO, BullMQ dispatch | `media_db` |
| `services/social-service` | 3004 | NestJS/Fastify | Posts, Feeds, Reels, Videos, Follow graph | `social_db` |
| `services/stories-service` | 3005 | NestJS/Fastify | Novels, Chapters, Library, Wallet, Payouts | `stories_db` |
| `services/media-worker` | — | Python | FFmpeg transcoding, HLS packaging, thumbnails | — |

## Frontend Client Repositories

| Repo | Port | Trách nhiệm | GitHub |
|---|---|---|---|
| `frontend/iam-web-client` | 4204 | SSO Login/Register + Ecosystem showcase landing | [daccuong-uit/iam-web-client](https://github.com/daccuong-uit/iam-web-client) |
| `frontend/social-web-client` | 4200 | Mạng xã hội: Feeds, Posts, Friends, Reels | [daccuong-uit/social-web-client](https://github.com/daccuong-uit/social-web-client) |
| `frontend/video-web-client` | 4201 | Video & Reels: Watch, HLS Streaming | [daccuong-uit/video-web-client](https://github.com/daccuong-uit/video-web-client) |
| `frontend/shop-web-client` | 4202 | Thương mại điện tử: Storefront, Cart | [daccuong-uit/shop-web-client](https://github.com/daccuong-uit/shop-web-client) |
| `frontend/stories-web-client` | 4203 | Đọc/Viết truyện: Long-form, Collections, Studio | [daccuong-uit/stories-web-client](https://github.com/daccuong-uit/stories-web-client) |
| `frontend/portfolio-web-client` | 4205 | Portfolio kỹ sư Đắc Cường (static SPA) | [daccuong-uit/portfolio-web-client](https://github.com/daccuong-uit/portfolio-web-client) |

---

## Quy tắc quan trọng

- **Không commit** `.env`, tokens, build output, `node_modules`, `dist/`.
- Dùng `.env.example` làm hợp đồng biến môi trường cho mỗi service.
- Mỗi service **sở hữu database riêng** — không bao giờ chia sẻ DB giữa các service.
- `stories-service` dùng biến `STORIES_DATABASE_URL` (trỏ vào `stories_db`). Biến `READING_DATABASE_URL` là alias tương thích ngược, cùng giá trị.
- Thay đổi source code không ảnh hưởng container đang chạy — cần `docker:*:restart` để apply.
- Tài liệu kiến trúc chi tiết trong [`docs/`](./docs/README.md).
