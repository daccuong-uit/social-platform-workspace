# Reals Platform — Workspace

Workspace điều phối của **Reals Platform** — chứa Docker Compose, infrastructure, tài liệu và các repository độc lập được lồng theo cấu trúc workspace.
## Kiến trúc tổng quan

Workspace là polyrepo: root quản lý Compose, infrastructure và orchestration; backend services, frontend clients, `platform` và `platform-frontend` có lịch sử Git độc lập. Web clients đi qua Gateway BFF bằng HttpOnly session cookie; Keycloak là identity provider; IAM sở hữu application profile theo `sub`.

Mỗi service sở hữu database riêng. Port, image và runtime configuration được quản lý trong `docker-compose.yml` cùng `.env.example`, không lặp lại ở README.

Tài liệu chuẩn: [docs/README.md](docs/README.md). Hướng dẫn cho agent: [CLAUDE.md](CLAUDE.md).
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

**Tên service hợp lệ**: `iam-postgres`, `social-postgres`, `media-postgres`, `stories-postgres`, `redis`, `minio`, `jaeger`, `gateway`, `iam-service`, `social-service`, `media-service`, `stories-service`, `media-worker`, `fe-iam`, `fe-social`, `fe-video`, `fe-shop`, `fe-stories`, `fe-portfolio`

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
| `repos:status` | Xem trạng thái git của tất cả 15 repos |
| `repos:commit` | Stage & commit tất cả repos với message mặc định |
| `repos:push` | Push tất cả repos lên `origin/main` |
| `repos:verify` | Kiểm tra `docker compose config` + `git diff --check` tất cả repos |

---

## Backend Service Repositories

| Repo | Port | Ngôn ngữ | Trách nhiệm | Database |
|---|---|---|---|---|
| `services/gateway` | 3000 | NestJS/Fastify | OIDC BFF, session, API routing and rate limiting | — |
| `services/iam-service` | 3001 | NestJS/Fastify | Application user profiles keyed by Keycloak `sub` | `iam_db` |
| `services/social-service` | 3002 | NestJS/Fastify | Posts, Feeds, Reels, Videos, Follow graph | `social_db` |
| `services/media-service` | 3003 | NestJS/Express | Upload, metadata, MinIO, BullMQ dispatch | `media_db` |
| `services/stories-service` | 3004 | NestJS/Fastify | Novels, Chapters, Library, Wallet, Payouts | `stories_db` |
| `services/media-worker` | — | Python | FFmpeg transcoding, HLS packaging, thumbnails | — |

## Frontend Client Repositories

| Repo | Port | Trách nhiệm | GitHub |
|---|---|---|---|
| `frontend/iam-web-client` | 4200 | Ecosystem landing; login redirects through Gateway to Keycloak | [daccuong-uit/iam-web-client](https://github.com/daccuong-uit/iam-web-client) |
| `frontend/social-web-client` | 4201 | Mạng xã hội: Feeds, Posts, Friends, Reels | [daccuong-uit/social-web-client](https://github.com/daccuong-uit/social-web-client) |
| `frontend/video-web-client` | 4202 | Video & Reels: Watch, HLS Streaming | [daccuong-uit/video-web-client](https://github.com/daccuong-uit/video-web-client) |
| `frontend/shop-web-client` | 4203 | Thương mại điện tử: Storefront, Cart | [daccuong-uit/shop-web-client](https://github.com/daccuong-uit/shop-web-client) |
| `frontend/stories-web-client` | 4204 | Đọc/Viết truyện: Long-form, Collections, Studio | [daccuong-uit/stories-web-client](https://github.com/daccuong-uit/stories-web-client) |
| `frontend/portfolio-web-client` | 4205 | Portfolio kỹ sư Đắc Cường (static SPA) | [daccuong-uit/portfolio-web-client](https://github.com/daccuong-uit/portfolio-web-client) |

## Shared Platform Repositories

| Repo | Nội dung | GitHub |
|---|---|---|
| `platform` | Backend libraries và contracts dùng chung | [daccuong-uit/platform](https://github.com/daccuong-uit/platform) |
| `platform-frontend` | Angular UI primitives và BFF client libraries | [daccuong-uit/platform-frontend](https://github.com/daccuong-uit/platform-frontend) |

---

## Quy tắc quan trọng

- **Không commit** `.env`, tokens, build output, `node_modules`, `dist/`.
- Dùng `.env.example` làm hợp đồng biến môi trường cho mỗi service.
- Mỗi service **sở hữu database riêng** — không bao giờ chia sẻ DB giữa các service.
- `stories-service` dùng biến `STORIES_DATABASE_URL` (trỏ vào `stories_db`). 
- Thay đổi source code không ảnh hưởng container đang chạy — cần `docker:*:restart` để apply.
- Tài liệu kiến trúc chi tiết trong [`docs/`](./docs/README.md).
