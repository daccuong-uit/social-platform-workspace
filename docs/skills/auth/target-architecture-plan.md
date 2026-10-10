# Reals Platform — Định hướng công nghệ và kiến trúc SSO & Nền tảng (v5 - Chuẩn hóa)

> **Mục tiêu tài liệu:** Định hướng kiến trúc SSO, hạ tầng và chuẩn hóa công nghệ cho hệ sinh thái `social-platform-workspace`.  
> **Trạng thái:** Đã tinh chỉnh đồng bộ 100% với bộ 3 tài liệu kiến trúc nền tảng:
> 1. [01. Kế hoạch Platform Backend (NestJS + PostgreSQL)](file:///d:/social-platform-workspace/.architecture/01.%20K%E1%BA%BF%20ho%E1%BA%A1ch%20Platform%20Backend%20%28NestJS%20+%20PostgreSQL%29.md)
> 2. [02. Kế hoạch Platform Frontend & Unified Design System (Angular + Tailwind v4)](file:///d:/social-platform-workspace/.architecture/02.%20K%E1%BA%BF%20ho%E1%BA%A1ch%20Platform%20Frontend%20&%20Unified%20Design%20System%20%28Angular%20+%20Tailwind%20v4%29.md)
> 3. [03. Kế hoạch Shared Contracts & Protocols (Cross-Platform FE & BE)](file:///d:/social-platform-workspace/.architecture/03.%20K%E1%BA%BF%20ho%E1%BA%A1ch%20Shared%20Contracts%20&%20Protocols%20%28Cross-Platform%20FE%20&%20BE%29.md)

---

## 1. Bối cảnh & Tối giản Hạ tầng (Anti Over-Engineering)

- Hệ sinh thái gồm **6 ứng dụng frontend** (`fe-iam`, `fe-social`, `fe-video`, `fe-shop`, `fe-stories`, `fe-portfolio`) và **6 microservices/workers** (`gateway`, `iam-service`, `social-service`, `media-service`, `stories-service`, `media-worker`).
- **Tối giản hạ tầng (Không tạo repo `infra` hay `keycloak` riêng biệt):**
  - Toàn bộ điều phối hạ tầng (Docker Compose, cấu hình Caddy, khởi tạo PostgreSQL, cấu hình realm Keycloak) nằm trực tiếp tại thư mục gốc **`social-platform-workspace`** (`docker-compose.yml`, `.env`, thư mục `scripts/` và `infra/`).
  - Tránh tuyệt đối việc phân mảnh tạo thêm các repo rời rạc gây phức tạp hóa quy trình CI/CD và quản lý.
- Quy mô mục tiêu: Phục vụ trơn tru từ 10k đến 50k người dùng, mở rộng bằng cách thay thế thành phần bên dưới các abstraction interface chứ không thiết kế lại từ đầu.

---

## 2. Định hướng Công nghệ Cốt lõi

| Lĩnh vực | Hướng giải pháp | Mức độ | Ghi chú & Ràng buộc |
|---|---|---|---|
| **Identity Provider** | **Keycloak 26.x** (OIDC/OAuth 2.0 chuẩn) thay thế hoàn toàn auth tự viết trong `iam-service` | **BẮT BUỘC** | Chỉ dùng chuẩn OIDC. Cấu hình realm và clients dạng code/JSON import trong Compose. |
| **Auth cho Web** | **BFF nằm trong Gateway** (Mô hình RFC 10017). Token ở server, trình duyệt chỉ có cookie phiên | **BẮT BUỘC** | **Xóa sạch token khỏi LocalStorage/JS.** Tuyệt đối không để trình duyệt cầm access/refresh token. |
| **SSO Đa App** | Mỗi frontend là một OIDC client trong Keycloak; SSO đến từ phiên Keycloak | **BẮT BUỘC** | Không chia sẻ token giữa các app. Đăng xuất một nơi kích hoạt **Back-Channel Logout** thoát toàn bộ 6 app. |
| **Xác thực ở Service** | Mỗi service tự verify JWT bằng JWKS của Keycloak qua `@daccuong-uit/backend-auth` | **BẮT BUỘC** | Không tin tưởng mù quáng header từ Gateway. Khóa người dùng duy nhất là **`sub` (UUID)**. |
| **Phân quyền** | Role từ Keycloak (`realm_access`, `resource_access`) + Resource ownership check trong service | **ƯU TIÊN** | Chưa cần engine phân quyền phức tạp (như OpenFGA). |
| **Phương thức Đăng nhập** | Password, Passkey, TOTP, Google, Apple (cấu hình trong Keycloak). SMS OTP chỉ là fallback | **BẮT BUỘC** | Tận dụng sẵn màn hình đăng nhập của Keycloak (Login Theme). |
| **Thư viện Backend** | Monorepo **`platform-backend`** (`@daccuong-uit/backend-*`) | **BẮT BUỘC** | Cung cấp auth, telemetry, database, http, event-bus, audit, testkit cho các backend microservice. |
| **Thư viện Frontend** | Monorepo **`platform-frontend`** (`@daccuong-uit/ui` + `@daccuong-uit/frontend-core`) | **BẮT BUỘC** | Thay thế ý tưởng `web-kit`. Cung cấp Unified Design System (Outfit, 4px grid, components) & BFF AuthClient. |
| **Hợp đồng dữ liệu** | Gói **`@daccuong-uit/contracts`** | **BẮT BUỘC** | Zero runtime dependencies, Zod schemas, RFC 9457 error codes, CloudEvents, pagination. |
| **Event giữa Service** | **Redis Streams + Transactional Outbox/Inbox** sau interface `EventBus` | **BẮT BUỘC** | Nâng cấp từ Pub/Sub (vốn không có độ bền) sang Streams để đảm bảo giao ít nhất một lần. |
| **Cơ sở dữ liệu** | **PostgreSQL 15/16 + Prisma ORM** (Database-per-service) | **BẮT BUỘC** | `iam_db`, `social_db`, `media_db`, `stories_db` độc lập, không truy vấn chéo DB. |
| **Object Storage** | S3 API (SeaweedFS / MinIO / Garage / Cloud S3) qua presigned URLs | **ƯU TIÊN** | Upload trực tiếp từ client lên S3 qua presigned URL, không stream qua Gateway. |
| **Edge Routing** | Caddy reverse proxy; route `/api/*` của mọi app đi về Gateway, cùng origin với app | **ƯU TIÊN** | Cho phép cookie phiên hoạt động mượt mà và an toàn giữa các domain app. |

---

## 3. Các Nguyên tắc Bất biến

1. **Không tự viết xác thực nghiệp vụ:** Đăng ký, đăng nhập, mật khẩu, MFA, phiên và token thuộc Keycloak.
2. **Trình duyệt tuyệt đối không bao giờ cầm access/refresh token:** Mọi giao tiếp xác thực của client chỉ dùng cookie phiên HttpOnly, Secure.
3. **`sub` của Keycloak là khóa người dùng duy nhất:** Mọi database service (`iam_db`, `social_db`,...) dùng UUID này làm khóa liên kết người dùng.
4. **Mỗi service sở hữu dữ liệu và ranh giới nghiệp vụ của mình:** Giao tiếp chỉ qua HTTP API hoặc Event có schema.
5. **Trạng thái gốc nằm ở PostgreSQL, không nằm ở Redis:** Mất Redis chỉ làm người dùng đăng nhập lại hoặc event được phát lại từ bảng `outbox_events`.
6. **Thay đổi tương thích ngược:** Bổ sung theo chiến lược *Expand → Migrate → Contract*.
7. **Không nhúng `localhost`, secret, hay URL cứng vào bundle/image:** Nạp cấu hình từ môi trường lúc chạy.
8. **Mọi thứ ngoài lõi nằm sau chuẩn:** OIDC, RFC 9457, W3C Trace Context, CloudEvents 1.0, S3 API.
9. **Không mở Keycloak Admin Console ra internet.**
10. **Tối giản hóa kiến trúc:** Không sinh thêm repo khi thư mục trong workspace hiện tại đã giải quyết triệt để vấn đề.

---

## 4. Danh mục Repositories & Trách nhiệm sau Chuẩn hóa

| Thành phần | Vị trí / Tên Repo | Trách nhiệm chính |
|---|---|---|
| **Điều phối & Hạ tầng** | `social-platform-workspace` (Gốc) | Quản lý Docker Compose, Caddyfile, Keycloak realm JSON, scripts vận hành polyrepo. **Không tạo repo `infra` riêng.** |
| **Hạ tầng Backend** | `platform-backend` (`packages/*`) | Cung cấp `@daccuong-uit/backend-*`: Core, Auth (Keycloak JWKS), Telemetry (OTel), HTTP (Fastify/Express), Database (Postgres), EventBus (Streams), Cache, Audit. |
| **Hạ tầng Frontend** | `platform-frontend` (`packages/*`) | Cung cấp `@daccuong-uit/ui` (Unified Design System, Outfit font, 4px grid, tokens OKLCH) & `@daccuong-uit/frontend-core` (BFF AuthClient). **Thay thế `web-kit`.** |
| **Hợp đồng dùng chung** | `@daccuong-uit/contracts` | Zero-dependency TypeScript/Zod schemas, RFC 9457 Problem Details, CloudEvents 1.0, Session models. |
| **API Gateway & BFF** | `services/gateway` | API Gateway, Rate limiting, và **OIDC BFF (RFC 10017)**: Quản lý session Redis, chuyển tiếp Keycloak access token xuống downstream, xử lý back-channel logout. |
| **IAM Service** | `services/iam-service` | Rút gọn: Bỏ đăng ký/đăng nhập/mật khẩu tự viết. Giữ Profile người dùng (tự động tạo theo `sub`), đồng bộ role qua Keycloak Admin API + Audit log. |
| **IAM Web Client** | `frontend/iam-web-client` | Đóng vai trò Landing Page đón đầu và Account Portal quản lý hồ sơ cá nhân. Giao diện login chuyển sang Keycloak Login Theme. |
| **5 Domain Clients** | `fe-social`, `fe-video`, `fe-shop`, `fe-stories`, `fe-portfolio` | Sử dụng `@daccuong-uit/ui` và `@daccuong-uit/frontend-core`, cấu hình bảng màu riêng theo domain (OKLCH tokens), không lưu token. |
| **Downstream Services**| `social-service`, `media-service`, `stories-service`, `media-worker` | Tự động xác thực JWT Keycloak bằng `@daccuong-uit/backend-auth`, chuyển event sang Redis Streams Outbox. |

---

## 5. Lộ trình Triển khai Thực tế (6 Bước)

1. **Bước 1: Chạy Keycloak trong Compose gốc:** Thêm container `keycloak` vào `docker-compose.yml`, import realm `reals` với các OIDC client định cấu hình sẵn, liên kết PostgreSQL cho Keycloak.
2. **Bước 2: Xây dựng 3 gói Platform nền tảng:**
   - `@daccuong-uit/contracts`: Đóng gói schemas dùng chung, `UserId` (UUID), `ProblemDetails`.
   - `platform-backend`: Đóng gói `@daccuong-uit/backend-auth` (JWKS), `backend-event-bus` (Streams Outbox).
   - `platform-frontend`: Đóng gói Design System tokens, component primitives, và BFF `AuthClient`.
3. **Bước 3: Nâng cấp Gateway thành OIDC BFF:**
   - Cài đặt luồng Authorization Code Flow trong Gateway.
   - Quản lý cookie phiên và lưu trữ token trong Redis.
   - Thêm endpoint nhận Back-Channel Logout từ Keycloak.
4. **Bước 4: Chuyển đổi Frontend sang BFF Auth:**
   - Cập nhật `iam-web-client` thành Landing Page + Account Portal.
   - Tích hợp `@daccuong-uit/frontend-core` vào cả 6 client, gỡ bỏ toàn bộ logic lưu token cũ trong LocalStorage.
   - Tích hợp `@daccuong-uit/ui` để đồng bộ UI, font Outfit, và spacing.
5. **Bước 5: Chuyển đổi Backend sang Keycloak Resource Server:**
   - Áp dụng `@daccuong-uit/backend-auth` cho các microservices để verify Keycloak JWT.
   - Rút gọn `iam-service`, di chuyển dữ liệu tài khoản hiện có sang Keycloak giữ nguyên UUID làm `sub`.
6. **Bước 6: Nâng cấp Event Bus & Hoàn thiện:**
   - Chuyển Pub/Sub sang Redis Streams + Transactional Outbox Pattern cho các sự kiện quan trọng.
