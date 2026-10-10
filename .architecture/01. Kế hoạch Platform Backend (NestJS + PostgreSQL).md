# 01. Kế hoạch Platform Backend v2 (NestJS + PostgreSQL)

> **Phạm vi tài liệu:** Kế hoạch kiến trúc và thi công monorepo **`platform-backend`** dành riêng cho hạ tầng microservices backend của dự án `social-platform-workspace`.  
> **Tuân thủ định hướng kiến trúc (`target-architecture-plan.md`):**
> 1. **Identity Provider:** Sử dụng **Keycloak 26.x** chuẩn OIDC/OAuth 2.0. Không tự viết xác thực trong `iam-service`. Khóa người dùng duy nhất là `sub` (UUID) của Keycloak xuyên suốt toàn bộ hệ thống.
> 2. **Kiến trúc Web Auth:** Triển khai mô hình **BFF (Backend-for-Frontend - RFC 10017)** tại `gateway`. Trình duyệt **tuyệt đối không cầm token**, chỉ dùng HttpOnly Secure cookie phiên.
> 3. **SSO & Back-Channel Logout:** Mỗi app client là một OIDC client trong Keycloak; đăng xuất toàn cục qua cơ chế back-channel logout.
> 4. **Xác thực tại từng Service:** Từng microservice tự động xác thực JWT qua JWKS của Keycloak bằng `@daccuong-uit/backend-auth`, không tin tưởng mù quáng header từ Gateway.
> 5. **Hạ tầng thực tế:** PostgreSQL (Database-per-service), Prisma ORM, Fastify/Express NestJS engine, Redis Streams + Outbox/Inbox Event Bus, và OpenTelemetry OTLP.

---

## 1. Bản đồ Kiến trúc & Phân nhiệm Microservices

```
                                  [ Trình duyệt / Web Clients ]
                                                │
                                    Cookie phiên (HttpOnly, Secure)
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              EDGE & GATEWAY BFF LAYER                                  │
│   - Reverse Proxy: Caddy (TLS tự động, route /api/* cùng origin với client)            │
│   - Gateway BFF (RFC 10017):                                                           │
│     * Quản lý luồng OIDC Authorization Code Flow với Keycloak                          │
│     * Lưu trữ session người dùng trong Redis (Mapping Session ID <-> Keycloak Tokens)   │
│     * Lựa chọn OIDC client theo Host của từng frontend app                             │
│     * Tiếp nhận Back-Channel Logout từ Keycloak để hủy phiên trong Redis               │
│     * Đính kèm Keycloak Access Token: Authorization: Bearer <JWT> tới các service      │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                     Mạng nội bộ / Authorization: Bearer <Keycloak JWT>
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DOWNSTREAM BACKEND MICROSERVICES                                │
│   Mỗi service tự độc lập xác thực JWT qua Keycloak JWKS (@daccuong-uit/backend-auth)   │
│                                                                                        │
│   ├── iam-service (Port 3001)    : Profile nghiệp vụ (liên kết qua sub UUID),          │
│   │                                Quản trị role qua Keycloak Admin API + Audit        │
│   ├── social-service (Port 3002) : Bài viết, bình luận, follow graph (social_db)      │
│   ├── media-service (Port 3003)  : Quản lý metadata media, Presigned S3 URLs (media_db)│
│   ├── media-worker               : Xử lý video/hình ảnh nền qua BullMQ                 │
│   └── stories-service (Port 3004): Khoảnh khắc 24h, reels (stories_db)                 │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                       Async Events (Transactional Outbox)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 EVENT BUS INFRASTRUCTURE                               │
│   - @daccuong-uit/backend-event-bus: Redis Streams + Outbox/Inbox Pattern              │
│   - Đảm bảo gửi tin cậy ít nhất một lần (At-least-once delivery)                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Cấu trúc Monorepo `platform-backend`

Monorepo quản lý bằng `pnpm` workspace, TypeScript NodeNext, Vitest:

```
platform-backend/
├── packages/
│   ├── backend-core/          # EntityId generator, AppException, loadConfig (Zod), Clock
│   ├── backend-telemetry/     # OTel bootstrap (--import), Pino JSON logger, W3C traceparent, metrics
│   ├── backend-http/          # setupApp(), RFC 9457 Problem Details filter, Fastify/Express adapters, health
│   ├── backend-database/      # PostgreSQL query helper, Prisma error mapper, bulk/soft delete
│   ├── backend-auth/          # Keycloak OIDC Resource Server (JWKS via jose), Fastify/Express Guards, @CurrentUser
│   ├── backend-audit/         # AuditEvent schema, PostgreSQL audit writer, @Audited decorator
│   ├── backend-event-bus/     # Redis Streams publisher/consumer + Outbox/Inbox interface
│   ├── backend-cache/         # Resilient ioredis client factory, cache manager
│   └── backend-testkit/       # Test suite kiểm tra tuân thủ RFC 9457, Keycloak JWKS, Health API
├── examples/
│   └── service-template/      # Service mẫu hoàn chỉnh (Fastify + Prisma + PostgreSQL + Redis + OTel)
├── docs/adr/                  # Architecture Decision Records
└── MIGRATION.md               # Hướng dẫn nâng cấp từng service
```

---

## 3. Chi tiết các Gói chức năng (Packages)

### 3.1. `@daccuong-uit/backend-auth` (Keycloak OIDC Resource Server)
Tuân thủ nghiêm ngặt **Nguyên tắc bất biến 1, 3 và 4**:
- **Xác thực JWT độc lập:**
  - Mọi service độc lập xác thực JWT bằng JWKS từ Keycloak endpoint (`AUTH_JWKS_URI` = `http://keycloak:8080/realms/reals/protocol/openid-connect/certs`).
  - Thư viện `jose`: Kiểm tra chữ ký bất đối xứng (RS256, ES256), `iss`, `aud`, hạn dùng `exp`, `nbf`, cấm thuật toán `none` và `HS256`.
  - Cache public key và tự động refresh khi gặp Key ID (`kid`) mới.
- **Khóa người dùng duy nhất (`sub`):**
  - Trích xuất claim `sub` (UUID do Keycloak cấp). Toàn bộ quan hệ người dùng trong DB của từng service (`iam_db`, `social_db`,...) đều lưu khóa ngoại là `user_id VARCHAR(36)` / `UUID` trỏ về `sub`.
- **Phân quyền (Roles & Ownership):**
  - Trích xuất role từ Keycloak token (`realm_access.roles` và `resource_access.{client_id}.roles`).
  - Cung cấp NestJS Guard tương thích cả Fastify và Express:
    - `@CurrentUser()`: Inject `UserPrincipal { sub, email, username, roles }` vào Controller handler.
    - `@Roles('admin', 'creator')`: Kiểm tra role hệ thống.
    - `@Public()`: Bỏ qua xác thực cho các route công khai.
  - Phân quyền sở hữu tài nguyên (Resource Ownership): Do service tự kiểm tra dựa trên `currentUserId === resource.ownerId`.

### 3.2. Cấu trúc BFF Auth tại `gateway` (Phối hợp với `@daccuong-uit/backend-auth`)
Mặc dù Gateway là một microservice riêng (`services/gateway`), nền tảng backend cung cấp cấu trúc chuẩn cho Gateway BFF:
- **OIDC Flow:** Quản lý Authorization Code Flow với PKCE. Khi người dùng click Đăng nhập, chuyển hướng sang Keycloak login page (hỗ trợ Password, Passkey, TOTP, Google, Apple).
- **Session Management:** Sau khi đổi authorization code lấy token từ Keycloak, Gateway:
  1. Lưu trữ `{ accessToken, refreshToken, idToken, user }` vào **Redis** theo Session ID.
  2. Gửi cookie phiên `__Host-session` (hoặc `reals_session`) về trình duyệt với cờ `HttpOnly; Secure; SameSite=Lax`.
- **API Proxying:** Khi trình duyệt gọi API (`/api/social/...`):
  1. Gateway đọc cookie phiên, tra Redis lấy access token.
  2. Tự động làm mới token qua Keycloak refresh token nếu token sắp hết hạn.
  3. Gắn header `Authorization: Bearer <accessToken>` và chuyển tiếp tới service hạ tầng.
- **Back-Channel Logout Endpoint (`/api/auth/backchannel-logout`):**
  - Keycloak gọi endpoint này khi người dùng đăng xuất từ bất kỳ app nào. Gateway thu hồi session trong Redis, lập tức vô hiệu hóa phiên của người dùng trên toàn bộ hệ sinh thái.

### 3.3. `@daccuong-uit/backend-core`
- **ID Generator (`EntityId`):**
  - Định dạng: 13 số epoch timestamp (mili giây) + 8 ký tự `crypto.randomBytes` hex/base36 → 21 ký tự (VD: `1760054400123K7QX92MA`).
  - Dùng cho các thực thể dữ liệu nghiệp vụ (Post, Comment, Media, Story). Riêng User ID tuân thủ quy chuẩn dùng Keycloak `sub` (UUID).
- **`AppException`:**
  - Base class cho lỗi nghiệp vụ chuẩn hóa, chứa `status`, `code`, `title`, `detail`, `errors[]`.
- **`loadConfig(schema)`:**
  - Nạp và xác thực `process.env` bằng Zod/Standard Schema. Chặn đứng ứng dụng khởi động nếu thiếu biến cấu hình bắt buộc.

### 3.4. `@daccuong-uit/backend-telemetry`
- **OpenTelemetry Instrumentation:**
  - Nạp qua `node --import ./instrumentation.mjs` trước khi NestJS khởi động.
  - Gắn spans cho HTTP, Fastify, Express, Prisma (PostgreSQL), Redis.
  - Đẩy telemetry qua OTLP về Jaeger (`localhost:4317` / `localhost:4318`).
- **Pino Structured Logger:**
  - Ghi JSON ra `stdout`, tự động inject `trace_id` và `span_id` từ span OTel đang chạy.
  - Che giấu (mask) dữ liệu nhạy cảm: `password`, `authorization`, `token`, `secret`, `cookie`.

### 3.5. `@daccuong-uit/backend-http`
- **Khởi tạo ứng dụng chuẩn (`setupApp`):**
  - Nhận diện tự động `FastifyAdapter` (Gateway, IAM, Social, Stories) hoặc `ExpressAdapter` (Media).
  - Tích hợp `ProblemDetailsFilter` tuân thủ RFC 9457 (`application/problem+json`).
  - Gắn validation pipe dựa trên Zod / Standard Schema.
  - Cung cấp endpoint sức khỏe không version: `/health/live` và `/health/ready` (kiểm tra PostgreSQL và Redis).

### 3.6. `@daccuong-uit/backend-database` (PostgreSQL + Prisma)
- **Ánh xạ mã lỗi PostgreSQL & Prisma:**
  - `23505` / Prisma `P2002` → `DB_DUPLICATE_KEY` (409 Conflict)
  - `23503` / Prisma `P2003` → `DB_FOREIGN_KEY_VIOLATION` (400 Bad Request)
  - `23502` → `DB_NOT_NULL_VIOLATION` (400 Bad Request)
  - `40001` → `DB_TRANSACTION_CONFLICT` (409 Conflict / Retry)
  - `40P01` → `DB_DEADLOCK` (500 Internal / Retry)
  - Prisma `P2025` → `DB_NOT_FOUND` (404 Not Found)
- **DynamicQueryHelper:**
  - Truy vấn an toàn chống SQL injection, whitelist trường sort/filter, giới hạn tối đa 100 bản ghi/trang.
- **Bulk Delete Endpoint Helper (`POST /v1/{resource}/bulk-delete`):**
  - Nhận mảng tối đa 100 IDs, thực thi trong một Prisma transaction, hỗ trợ soft delete (`deletedAt`).

### 3.7. `@daccuong-uit/backend-event-bus` (Redis Streams + Outbox)
Nâng cấp từ Pub/Sub sang **Redis Streams + Transactional Outbox Pattern**:
- **Lý do:** Redis Pub/Sub không có tính bền vững (mất event nếu service tạm thời ngắt kết nối).
- **Cơ chế Outbox:**
  - Khi service ghi dữ liệu vào PostgreSQL, ghi kèm bản ghi sự kiện vào bảng `outbox_events` trong cùng một transaction DB.
  - Background worker (Relay) đọc bảng `outbox_events` và đẩy vào **Redis Streams** (`reals.events`).
  - Consumer đọc từ Redis Streams theo Consumer Group, tự động lưu vết qua bảng `inbox_events` để đảm bảo xử lý chính xác một lần (Idempotency).

### 3.8. `@daccuong-uit/backend-audit`
- **PostgreSQL Audit Trail:**
  - Lưu bảng `audit_events` trong DB của từng service.
  - Ghi nhận: thay đổi quyền, xóa bản ghi, xuất dữ liệu.
  - Actor ID lưu trữ chính là `sub` (UUID) của người dùng từ token.

### 3.9. `@daccuong-uit/backend-testkit`
- **Bộ kiểm tra tuân thủ:**
  - Tự động kiểm thử: định dạng lỗi RFC 9457, header `traceparent`, xác thực JWT Keycloak (mock JWKS), health check endpoints.

---

## 4. Lộ trình thi công Backend Platform

1. **Khởi tạo Monorepo:** Cấu hình pnpm workspace, TypeScript strict mode (NodeNext), Vitest.
2. **Xây dựng Core & Telemetry:** `backend-core`, `backend-telemetry`.
3. **Xây dựng HTTP & Database:** `backend-http` (Fastify + Express), `backend-database` (PostgreSQL + Prisma).
4. **Xây dựng Bảo mật OIDC:** `@daccuong-uit/backend-auth` tích hợp Keycloak JWKS, Fastify/Express guards.
5. **Xây dựng Event Bus & Audit:** `backend-event-bus` (Redis Streams + Outbox), `backend-audit`.
6. **Kiểm thử & Đóng gói:** `backend-testkit`, `examples/service-template`.
7. **Nâng cấp các service:** Cập nhật `gateway` (BFF OIDC), rút gọn `iam-service` (bỏ auth tự viết, chỉ giữ Profile & Keycloak Admin sync), cập nhật `social-service`, `media-service`, `stories-service`.
