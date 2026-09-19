# Reals Platform — Định hướng công nghệ và kiến trúc (v5)

**Date:** 2026-09-19 · **Status:** Proposed
**Loại tài liệu:** định hướng, không phải kế hoạch triển khai. Người soạn **chưa đọc code của các repo**. Agent đọc repo, đối chiếu với tài liệu này rồi tự lập kế hoạch chi tiết.

---

## 1. Cách dùng tài liệu này

| Nhãn | Ý nghĩa với agent |
|---|---|
| **BẮT BUỘC** | Ràng buộc của định hướng. Nếu repo thực tế mâu thuẫn hoặc không làm được, **dừng và báo lại**, không tự đổi hướng |
| **ƯU TIÊN** | Lựa chọn mặc định. Agent được đổi nếu có lý do cụ thể từ repo hoặc từ tài liệu chính thức, và phải ghi rõ lý do |
| **AGENT QUYẾT** | Tài liệu cố ý không quy định. Agent quyết dựa trên code thực tế |

Các file trong `reference/` là bản phân tích chi tiết cũ, chỉ để tham khảo ý tưởng. **Không coi là yêu cầu**, và chúng đã bị thay bởi tài liệu này khi có khác biệt.

---

## 2. Bối cảnh và mục tiêu

- Hệ thống gồm 4 app domain (social, video, shop, stories), portfolio, iam-web-client, iam-service, gateway và các backend service khác. **Mỗi client và service là một repo riêng, một Dockerfile riêng.**
- Quy mô hiện tại khoảng **10k người dùng**. Chạy trên hạ tầng sẵn có hoặc miễn phí, tự vận hành, tối giản.
- Mục tiêu: các thành phần chạy trơn tru trên công nghệ hiện đại, có SSO, không để token ở trình duyệt, dễ thêm service/tính năng mới, và **mở rộng lên quy mô lớn hơn bằng cách thay thành phần chứ không thiết kế lại**.
- Chưa triển khai hạ tầng cho 100k hay 1M user.

---

## 3. Định hướng công nghệ

| Lĩnh vực | Hướng | Mức | Ghi chú |
|---|---|---|---|
| Identity Provider | **Keycloak** (OIDC/OAuth 2.0 chuẩn) thay phần tự viết trong iam-service | BẮT BUỘC | Chỉ dùng chuẩn OIDC. Không viết SPI riêng cho logic nghiệp vụ. Cấu hình realm/client là code |
| Auth cho web | **BFF nằm trong gateway** (mô hình khuyến nghị của RFC 10017). Token ở server, trình duyệt chỉ có cookie phiên | BẮT BUỘC | Xóa token khỏi LocalStorage/JS |
| SSO | Mỗi app là một OIDC client; SSO đến từ phiên Keycloak. Đăng xuất một nơi thoát mọi app (back-channel logout) | BẮT BUỘC | Không chia sẻ token/cookie giữa app |
| Xác thực ở service | Mỗi service tự verify JWT bằng JWKS của Keycloak | BẮT BUỘC | Không tin "đã qua gateway" |
| Phân quyền | Role từ Keycloak + kiểm tra quyền sở hữu trong từng service | ƯU TIÊN | Chưa cần engine phân quyền riêng |
| Cách đăng nhập | Password, Google, Apple, **Passkey**, **TOTP** là cấu hình Keycloak. SMS OTP chỉ là fallback, để sau | BẮT BUỘC (thứ tự ưu tiên) | Không phụ thuộc nhà cung cấp SMS |
| Event giữa service | **Redis Streams** + Transactional Outbox/Inbox, sau một interface `EventBus` | BẮT BUỘC dùng Redis; chi tiết AGENT QUYẾT | Thay Pub/Sub hiện tại (không bền) |
| Job nền | **BullMQ** trên Redis | ƯU TIÊN | |
| Cơ sở dữ liệu | PostgreSQL, mỗi service một database và user riêng | BẮT BUỘC | Không truy vấn chéo DB |
| Object storage | Chỉ dùng **S3 API** qua một lớp trừu tượng. Tự host bằng SeaweedFS (hoặc Garage), hoặc dịch vụ S3-compatible có gói miễn phí | ƯU TIÊN | **Không dùng MinIO cho hệ thống mới** (repo community đã bị archive năm 2026) |
| Upload media | Upload trực tiếp lên object storage bằng presigned URL, không stream qua gateway | ƯU TIÊN | Làm khi app video/stories cần |
| Edge | Caddy làm reverse proxy, định tuyến theo host, TLS tự động. `/api/*` của mọi app đi về gateway, cùng origin với app | ƯU TIÊN | Để các repo app chỉ là static, độc lập nhau |
| Triển khai | Docker Compose trên 1 VM; mỗi repo build image, đẩy GHCR; repo `infra` giữ cấu hình chạy | ƯU TIÊN | Không cần Kubernetes ở giai đoạn này |
| CI/CD | GitHub Actions cho từng repo; Renovate cập nhật package/tag | ƯU TIÊN | |
| Backup | Backup PostgreSQL định kỳ **ra ngoài VM** (khác nhà cung cấp) và **thử restore** | BẮT BUỘC | IAM mất là mất toàn hệ thống |
| Bí mật | Mã hóa secrets trong `infra` (ví dụ SOPS + age); không secret trong image/repo dạng rõ | BẮT BUỘC | |
| Stack | Node 24 LTS, NestJS 11, Angular 21, PostgreSQL 18, Keycloak 26.x, Redis 8.x hoặc Valkey | ƯU TIÊN | Agent kiểm tra tương thích với repo trước khi nâng |
| Quan sát | Giữ logger/tracing trong `platform`; giám sát uptime nhẹ; bật telemetry sâu khi cần | ƯU TIÊN | |
| Response API | Giữ envelope hiện tại của gateway | ƯU TIÊN | Không đổi hàng loạt frontend chỉ vì chuẩn |

---

## 4. Nguyên tắc bất biến

1. **Không tự viết xác thực.** Đăng ký, đăng nhập, mật khẩu, MFA, phiên và refresh token thuộc Keycloak.
2. **Trình duyệt không bao giờ cầm access/refresh token.**
3. **`sub` của Keycloak là khóa người dùng duy nhất** ở mọi service. Khi migrate, giữ nguyên UUID người dùng hiện có làm `sub`.
4. **Mỗi service sở hữu dữ liệu và quyền của mình.** Giao tiếp chỉ qua HTTP API và event có schema.
5. **Trạng thái gốc nằm ở PostgreSQL**, không ở Redis. Mất Redis chỉ làm người dùng đăng nhập lại và event được phát lại từ outbox.
6. **Chỉ thay đổi tương thích ngược** giữa các repo (thêm, không xóa/đổi nghĩa). Thay đổi phá vỡ chạy song song hai phiên bản, đổi theo *expand → migrate → contract*.
7. **Không nhúng `localhost`, secret, hay URL cứng vào bundle/image.** Cấu hình đến từ môi trường lúc chạy.
8. **Mọi thứ ngoài lõi nằm sau chuẩn hoặc interface** (OIDC, JWT, PostgreSQL, S3, SMTP, `EventBus`) để đổi nhà cung cấp hoặc nâng quy mô không phải viết lại nghiệp vụ.
9. **Không mở Keycloak Admin Console ra internet.**
10. **Chỉ trả tiền và vận hành thêm khi số liệu thật đòi hỏi.**

---

## 5. Repo bị ảnh hưởng

Tên repo là tên gọi chung, agent đối chiếu với tên thật.

| Repo | Mức ảnh hưởng | Hướng thay đổi |
|---|---|---|
| `gateway` | **Lớn** | Thêm vai trò OIDC BFF (login/callback/session/logout/back-channel logout), session lưu Redis, chọn OIDC client theo host. Vẫn là proxy và rate limit. Bỏ cơ chế tự verify token của iam-service |
| `iam-service` | **Lớn** | Rút gọn: bỏ đăng ký/đăng nhập/mật khẩu/OTP/JWT/session. Giữ Profile (tạo tự động theo `sub`), quản trị role qua Keycloak Admin API kèm audit, phát event. Là nơi migrate user sang Keycloak |
| `iam-web-client` | **Lớn** | Thành landing + account portal. Giao diện đăng nhập/đăng ký chuyển sang Keycloak. Bỏ toàn bộ lưu token phía client. Landing theo `landing-page.md` |
| `social`, `video`, `shop`, `stories` (web) | Vừa | Mỗi app thêm một OIDC client, dùng thư viện auth-client chung, cấu hình lúc chạy, Dockerfile static |
| `portfolio` | Nhỏ | Giữ site tĩnh, công khai, không cần đăng nhập |
| `social-service`, `media-service`, service khác | Vừa | Verify JWT Keycloak bằng thư viện chung; kiểm tra role/sở hữu; chuyển event sang Streams + outbox/inbox; media chuyển sang presigned upload khi cần |
| `platform` (packages `@daccuong-uit/*`) | Vừa–Lớn | Thêm module verify JWT/JWKS + guard role; nâng `platform-event-bus` lên Redis Streams + outbox/inbox sau interface; giữ logger, tracing, config, http-common, contracts-events |
| `web-kit` (**repo mới**) | Mới | Package frontend dùng chung: design tokens (theme Ember Night), UI components, auth-client (chỉ gọi endpoint phiên của gateway, không đụng token) |
| `keycloak` (**repo mới**) | Mới | Image Keycloak của dự án: theme đăng nhập, cấu hình realm/client/flow dạng code |
| `infra` (**repo mới**) | Mới | Compose (dev/prod), cấu hình Caddy, khởi tạo database, backup/restore, deploy, secrets mã hóa, runbook |
| `architecture` (docs hiện có) | Nhỏ | Cập nhật snapshot sau mỗi giai đoạn |

---

## 6. Giai đoạn (thứ tự ưu tiên, không phải lịch)

1. **Nền:** Keycloak chạy được ở dev và prod, cấu hình là code, Caddy, backup + restore thử thành công.
2. **Thư viện dùng chung:** verify JWT, event bus Streams, auth-client, design tokens.
3. **Web auth:** gateway làm BFF, iam-web-client chuyển sang cookie phiên, hết token trong trình duyệt.
4. **Backend:** service chuyển sang verify JWT Keycloak (chạy song song bộ verify cũ trong lúc chuyển), iam-service rút gọn, migrate user giữ UUID.
5. **SSO đa app:** từng app thêm client, đăng nhập một lần dùng nhiều app, đăng xuất toàn cục.
6. **Event và media:** chuyển event sang Streams + outbox, presigned upload và worker khi có nhu cầu.

Mỗi giai đoạn phải rollback được và không big bang. Thứ tự phát hành giữa repo: `platform` → service → `gateway` → app.

---

## 7. Agent cần xác minh trong repo trước khi lập kế hoạch

**Hiện trạng xác thực và dữ liệu**
- Luồng đăng ký/đăng nhập/refresh hiện tại, nơi lưu token phía client, cách gateway và các service đang xác thực.
- Thuật toán và tham số băm mật khẩu hiện tại (Argon2?), có import được vào Keycloak không; số lượng và trạng thái user; các bảng/cột định danh mà service khác đang tham chiếu.
- Dữ liệu OTP/số điện thoại đang dùng và cách xử lý khi SMS chỉ còn là fallback.

**Hợp đồng giữa các repo**
- Response envelope, mã lỗi và các route gateway mà frontend đang phụ thuộc.
- Chỗ nào dùng Redis Pub/Sub, event nào đang phát và ai nhận; cách publish/consume hiện tại trong `platform-event-bus`.
- Service nào đang import code hoặc truy vấn DB của service khác (vi phạm nguyên tắc 4).

**Build và triển khai**
- Phiên bản thực tế của Angular, NestJS, Node, Prisma, Redis, PostgreSQL và mức nâng cần thiết.
- Dockerfile, CI, quy trình publish package và image hiện có; cách app đang nhận cấu hình (URL không gian, API base) và có nhúng `localhost` không.
- Cách các frontend hiện gọi API (Nginx proxy, CORS, biến môi trường).

**Kiểm tra tính khả thi của định hướng (nếu không khớp thì báo lại)**
- Import hash mật khẩu vào Keycloak; hỗ trợ passkey, recovery codes, back-channel logout, và công cụ áp cấu hình realm ở đúng phiên bản Keycloak dùng.
- Cách đăng ký trang đăng ký của Keycloak từ nút "Tạo tài khoản" ở landing.
- Cách hoạt động của cookie `__Host-` khi chạy dev trên `localhost` với proxy của Angular.

---

## 8. Không làm bây giờ, và đường mở rộng

**Chưa làm:** Kubernetes, service mesh, Envoy, Kafka/NATS, OpenFGA, Temporal, đa vùng, nhiều node Keycloak/PostgreSQL, SMS OTP, luồng thanh toán/PCI, GraphQL, Module Federation.

**Mở rộng sau này là thay thành phần, không thiết kế lại:**

| Khi cần | Thay đổi |
|---|---|
| Keycloak/PostgreSQL cần chạy liên tục | Thêm node, replica, hoặc chuyển managed |
| Redis không đủ cho event | Thêm adapter NATS JetStream hoặc Kafka sau `EventBus` |
| Nhiều VM/service | Chuyển Compose sang k3s/Kubernetes, giữ nguyên image và cấu hình |
| Mobile native | Bật public client PKCE trong Keycloak, thêm route Bearer ở edge |
| Thanh toán, step-up | Dùng `acr`; ưu tiên trang thanh toán do provider host (ngoài phạm vi PCI); cách ly khi có provider |
| SMS OTP | Thêm authenticator Keycloak + adapter nhà cung cấp SMS |
| Yêu cầu vùng/dữ liệu | Di chuyển domain dữ liệu theo vùng nhờ cấu hình và ranh giới đã có |

---

## 9. Điểm con người cần chốt

1. **Domain gốc:** `reals.vn` (bạn nói) hay `reals.id` (`landing-page.md`)? Tài liệu dùng `reals.vn`, agent xử lý như một biến cấu hình.
2. **VM và nơi lưu backup ngoài VM** (ảnh hưởng thành phần nào bật ngay).
3. **Nhà cung cấp SMTP** cho email xác minh và đặt lại mật khẩu.
4. **Repo và package private hay public** (ảnh hưởng giới hạn miễn phí của registry).
