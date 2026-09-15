# Reals Platform — Workspace

Workspace này là điểm tích hợp trung tâm của **Reals Platform** — một nền tảng mạng xã hội đa không gian theo kiến trúc microservices + micro-frontend. Nó chứa cấu hình Docker Compose cho toàn bộ stack, tài liệu kiến trúc, và các services backend.

## Kiến trúc tổng quan

```text
                        ┌────────────────────────────────────────────────────┐
                        │              FRONTEND CLIENTS (Angular 21)          │
                        │                                                      │
   :4204  fe-iam    ────┤  IAM Landing & SSO         (iam-web-client)         │
   :4200  fe-social ────┤  Social – Feeds / Posts    (social-web-client)      │
   :4201  fe-video  ────┤  Video  – Watch / Reels    (video-web-client)       │
   :4202  fe-shop   ────┤  Shop   – Storefront       (shop-web-client)        │
   :4203  fe-stories────┤  Stories – Reading / Write (stories-web-client)     │
   :4205  fe-portfolio──┤  Portfolio – Dev Portfolio  (portfolio-web-client)   │
                        └──────────────┬─────────────────────────────────────┘
                                       │  /api/  (nginx proxy)
                                       ▼
                              ┌─────────────────┐
                              │  gateway :3000   │  API Gateway
                              └────────┬────────┘
                 ┌────────────────────┼────────────────────┐
                 ▼                    ▼                     ▼
        iam-service :3001   media-service :3003   social-service :3004
              │                   │  │                    │
         iam_db :5433      media_db :5434          social_db :5435
                                  │
                           media-worker ──→ Redis + MinIO
                                  │
                              Jaeger (OTEL)
```

## Port Map

| Service | Port | URL |
|---|---|---|
| **fe-iam** | 4204 | http://localhost:4204 — Landing & SSO |
| **fe-social** | 4200 | http://localhost:4200 — Social Feeds |
| **fe-video** | 4201 | http://localhost:4201 — Video & Reels |
| **fe-shop** | 4202 | http://localhost:4202 — Storefront |
| **fe-stories** | 4203 | http://localhost:4203 — Stories |
| **fe-portfolio** | 4205 | http://localhost:4205 — Portfolio |
| **gateway** | 3000 | http://localhost:3000/api/v1/health |
| **iam-service** | 3001 | Internal |
| **media-service** | 3003 | Internal |
| **social-service** | 3004 | Internal |
| **PostgreSQL IAM** | 5433 | Internal |
| **PostgreSQL Media** | 5434 | Internal |
| **PostgreSQL Social** | 5435 | Internal |
| **Redis** | 6379 | Internal |
| **MinIO** | 9000/9001 | http://localhost:9001 (console) |
| **Jaeger** | 16686 | http://localhost:16686 |

## Khởi động nhanh

```powershell
# 1. Chuẩn bị .env
Copy-Item .env.example .env
# Sửa .env theo môi trường local

# 2. Khởi động toàn bộ stack
npm run project:up

# 3. Kiểm tra trạng thái
docker compose ps
```

**Cổng chính:**
- Landing & Auth: http://localhost:4204
- Social Feed:    http://localhost:4200
- Video:          http://localhost:4201
- Shop:           http://localhost:4202
- Stories:        http://localhost:4203
- Portfolio:      http://localhost:4205
- API Health:     http://localhost:3000/api/v1/health

## Khởi động từng nhóm

```powershell
# Chỉ infrastructure (DB, Redis, MinIO, Jaeger)
npm run infra:up

# Một service cụ thể (rebuild nếu cần)
npm run service:up -- fe-social
npm run service:down -- fe-social

# Tắt toàn stack (giữ volumes)
npm run project:down

# Tắt và xóa volumes (mất data DB local)
docker compose down -v
```

## Frontend Client Repositories

Mỗi client là một repo Angular 21 độc lập với Nx workspace:

| Repo | Trách nhiệm | GitHub |
|---|---|---|
| `iam-web-client` | SSO Login/Register + Fullsite Showcase Landing | [daccuong-uit/iam-web-client](https://github.com/daccuong-uit/iam-web-client) |
| `social-web-client` | Mạng xã hội: Feeds, Posts, Friends, Reels | [daccuong-uit/social-web-client](https://github.com/daccuong-uit/social-web-client) |
| `video-web-client` | Video & Reels: Watch, HLS Streaming | [daccuong-uit/video-web-client](https://github.com/daccuong-uit/video-web-client) |
| `shop-web-client` | Thương mại điện tử: Storefront, Cart | [daccuong-uit/shop-web-client](https://github.com/daccuong-uit/shop-web-client) |
| `stories-web-client` | Đọc/Viết bài: Long-form, Collections | [daccuong-uit/stories-web-client](https://github.com/daccuong-uit/stories-web-client) |
| `portfolio-web-client` | Portfolio kỹ sư Đắc Cường (static SPA) | [daccuong-uit/portfolio-web-client](https://github.com/daccuong-uit/portfolio-web-client) |

## Backend Service Repositories

| Repo | Trách nhiệm |
|---|---|
| `services/gateway` | API Gateway & request routing |
| `services/iam-service` | Unified Identity & Access Management |
| `services/media-service` | Media metadata & storage records |
| `services/media-worker` | Background media processing (FFmpeg) |
| `services/social-service` | Social graph & content domains |

## Quy tắc quan trọng

- **Không commit** `.env`, tokens, build output, `node_modules`, `dist/`.
- Dùng `.env.example` làm hợp đồng biến môi trường.
- Mỗi service **sở hữu database riêng** — không bao giờ chia sẻ DB giữa các service.
- Thay đổi source code của một client không ảnh hưởng container đang chạy — cần `docker compose build` và `up -d` lại.
