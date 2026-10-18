# Reals Platform — Định hướng công nghệ và kiến trúc SSO & Nền tảng (v5 - Chuẩn hóa)

> **Mục tiêu tài liệu:** Định hướng kiến trúc SSO, hạ tầng và chuẩn hóa công nghệ cho hệ sinh thái `social-platform-workspace`.  
> **Trạng thái:** Kiến trúc đích. Trạng thái rollout và cleanup được theo dõi trong implementation sync plan.

> Tham chiếu: [Platform Backend](./platform-backend-plan.md), [Platform Frontend](./platform-frontend-plan.md), [Shared Contracts](./shared-contracts-plan.md).
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

## 5. Trạng thái và Bước Tiếp Theo

Các nền tảng dùng chung, Keycloak realm/configuration, Gateway OIDC BFF, backend JWT verifier và frontend AuthClient/UI đã có implementation trong các repository tương ứng. Phần còn lại không phải xây lại các thành phần này mà là đồng bộ từng consumer theo phiên bản package đã publish, kiểm chứng luồng thực tế và chỉ dọn legacy sau khi consumer chuyển xong.

| Lớp | Nguồn implementation | Trạng thái rollout |
|---|---|---|
| Backend shared packages và contracts | `platform/` | Có implementation; cần xác nhận package release/registry access và consumer version. |
| Frontend shared UI và BFF client | `platform-frontend/` | Có implementation; cần phát hành và xác nhận các client resolve đúng package. |
| Keycloak, realm và infrastructure | `infra/keycloak/`, `docker-compose.yml` | Đã cấu hình trong workspace; xác nhận môi trường qua smoke tests. |
| Gateway OIDC BFF | `services/gateway/` | Có login/callback/session/refresh/logout/back-channel flow; tiếp tục test theo origin và downstream. |
| Backend consumers | `services/*/` | Đồng bộ theo service; không giả định mọi package/contract đã được consume chỉ vì dependency tồn tại. |
| Web clients | `frontend/*/` | Social là client ưu tiên; IAM/Portfolio giữ landing; các client domain còn lại theo phase sản phẩm. |

Thứ tự migration, acceptance gates và cleanup inventory nằm tại [Implementation Sync & Cleanup Plan](./implementation-sync-cleanup-plan.md). Không chạy lại các bước tạo package hoặc dựng BFF như một dự án mới.
