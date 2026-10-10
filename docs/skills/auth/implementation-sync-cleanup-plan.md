# Kế hoạch Đồng bộ Implementation và Dọn Legacy

> **Mục đích:** Đồng bộ backend services và các client đang hoạt động theo các package/chuẩn đã triển khai trong `.architecture`, `platform` và `platform-frontend`; loại bỏ phần trùng lặp hoặc nằm ngoài phạm vi sau khi xác nhận không còn consumer.
>
> **Không thuộc mục tiêu:** Xây lại platform packages, mở rộng nghiệp vụ sản phẩm, hoặc triển khai feature cho các client đang để sau.

## 1. Phạm vi

### Làm trong đợt này

- Đối chiếu implementation thực tế với các package và hợp đồng đã có; sửa consumer để dùng đúng nguồn dùng chung.
- Đồng bộ Gateway, IAM, Social, Media, Stories và Media Worker theo đúng vai trò từng service.
- Hoàn thiện client Social và giữ hai client IAM/Portfolio ở phạm vi landing page.
- Dọn auth/event/API wrappers, package dependencies và config legacy chỉ sau khi chứng minh không còn nơi sử dụng.

### Để sau

- Feature và tích hợp nghiệp vụ cho `video-web-client`, `shop-web-client`, `stories-web-client`.
- Account portal, portfolio showcase và các feature ngoài landing page.
- Bổ sung platform package, design system component hoặc domain mới không cần thiết cho việc đồng bộ.

## 2. Nguyên tắc dọn dẹp

1. Xem các package nền tảng và thiết kế trong ba tài liệu `.architecture` là đã triển khai; không tạo lại hoặc đổi kiến trúc nếu chỉ cần migrate consumer.
2. Lấy package đã publish và contract đang được consumer sử dụng làm nguồn chuẩn; ghi lại mapping package cũ → package chuẩn trước khi đổi.
3. Thực hiện theo **Expand → Migrate → Contract**. Không xóa API, bảng dữ liệu, event hay dependency khi còn consumer hoặc chưa có đường rollback.
4. Chỉ xóa mã/dependency có bằng chứng không còn reference trong source, build config, deployment config và runtime.
5. Không xóa `localStorage` dùng cho theme/preferences; chỉ loại bỏ việc lưu/đọc credential và code auth dead trong các client thuộc phạm vi.
6. Không xóa thủ công `dist`, `.nx/cache` hoặc output build để thay cho việc dọn source; để build pipeline tái tạo artifact.
7. Media Worker giữ runtime Python. Chỉ đồng bộ protocol, config và observability; không chuyển worker sang NestJS.

## 3. Danh sách Đồng bộ Theo Repo

| Repo | Đồng bộ với implementation đã có | Phần cần loại bỏ sau migration |
|---|---|---|
| `services/gateway` | Giữ Gateway là chủ sở hữu OIDC BFF, Redis session, refresh, proxy token và back-channel logout. Đối chiếu endpoint/contract với `frontend-core`; rà config host, callback, cookie, redirect và downstream JWT. | Chỉ bỏ auth/proxy path trùng lặp nếu tìm thấy consumer thay thế và test xác nhận. Không tạo BFF thứ hai trong service/client. |
| `services/iam-service` | Giữ profile theo Keycloak `sub`, role/admin sync và audit theo trách nhiệm hiện tại. Đối chiếu auth guard, issuer/audience và schema với backend packages. | Lập inventory các module, endpoint và bảng auth/session/token tự quản; migrate dữ liệu/consumer trước, rồi mới xóa phần không còn thuộc IAM. Không xóa chỉ dựa vào tên module hoặc bảng. |
| `services/social-service` | Đồng bộ auth/ownership, UserId/EntityId, lỗi, pagination và event payload với packages/contracts hiện hành. Chuyển các event cần độ bền sang `backend-event-bus` Outbox/Streams; giữ Pub/Sub cho event ephemeral nếu còn phù hợp. | Sau khi chuyển consumer, bỏ adapter/event schema cũ và dependency `platform-event-bus`/`contracts-events` chỉ khi không còn service nào dùng. Không đưa API mới vào Social nếu không phục vụ client hiện tại. |
| `services/media-service` | Đồng bộ JWT, ownership, health/config, lỗi và telemetry với backend packages phù hợp. Giữ MinIO/S3 và BullMQ là phần chuyên biệt của media; dùng presigned URL trong luồng upload cần thiết. | Bỏ helper/package trùng lặp đã được thay thế. Không thêm Outbox hoặc EventBus nếu không có event media cần giao bền vững. |
| `services/stories-service` | Đồng bộ auth, contracts, lỗi và event theo domain đang chạy. Bảo toàn nghiệp vụ đọc truyện hiện tại; không đổi service thành Stories 24h/reels trong kế hoạch này. | Gỡ event/API adapter cũ sau khi consumer được chuyển. Không xóa module đọc truyện hoặc schema nghiệp vụ chỉ vì không khớp tên “stories” ở tài liệu khác. |
| `services/media-worker` | Giữ Python; thống nhất job/event schema với Media Service, cấu hình runtime, retry/idempotency, log và correlation/trace. | Dọn protocol hoặc biến môi trường không còn được producer/worker sử dụng. Không thêm dependency NestJS/backend packages vào Python worker. |
| `frontend/social-web-client` | Dùng `AuthClient`/`UserSessionStore`/interceptor từ `frontend-core`; gọi API qua BFF cookie; áp contracts cho session, errors và pagination ở các luồng đang có. | Gỡ token-based guard/interceptor, auth logic hoặc wrapper trùng lặp khi đã thay thế và có test. Giữ local storage cho UI preferences. |
| `frontend/iam-web-client` | Giữ landing hiện có; các CTA đăng nhập đi qua Gateway/Keycloak. Không xây account portal trong đợt này trừ phần cần để landing hoạt động. | Gỡ route/form login-register và auth service cũ nếu không còn yêu cầu/consumer sau cutover; giữ nội dung landing. |
| `frontend/portfolio-web-client` | Giữ landing hiện có và chỉ dùng shared UI/theme nơi landing thực sự cần. | Gỡ auth shell/guard/service không được landing sử dụng; không xây showcase hoặc profile editor trong đợt này. |
| `frontend/video-web-client`, `frontend/shop-web-client`, `frontend/stories-web-client` | Không migration feature trong đợt này. Ghi nhận package/version hiện tại để phase sau tiếp tục từ trạng thái thật. | Không xóa scaffold hoặc shared dependency chỉ vì chưa có feature; chỉ xóa code chết khi xác nhận độc lập với kế hoạch tương lai. |
| `platform`, `platform-frontend` | Giữ các package nền tảng đã triển khai; phát hành/version pin ổn định, migration notes và test consumer. | Các package legacy như `security-sdk`, `event-bus`, `http-common`, `logger`, `tracing`, `cache`, `config` chỉ là ứng viên dọn sau khi kiểm tra toàn workspace và các consumer ngoài workspace. |

## 4. Trình tự Thực hiện

### Phase A — Chụp hiện trạng và chốt mapping

- Lập bảng package/version đang publish, package được từng repo khai báo, package thực sự import trong source và contract đang chạy ở runtime.
- Trước khi đổi consumer dependency, xác nhận package có thể cài từ registry `@daccuong-uit` bằng quyền user/CI hiện hành. Tại lần triển khai đầu, `@daccuong-uit/backend-auth` và `@daccuong-uit/contracts` trả 404 trong khi `NODE_AUTH_TOKEN` chưa được cấu hình trong terminal; kết quả này có thể là package chưa publish hoặc thiếu quyền truy cập. Cấu hình auth qua môi trường user/CI rồi xác minh version; chỉ tạo/publish changeset nếu package thực sự chưa có. Không thay bằng dependency `file:` trong manifest production.
- Tìm reference trong source/config/deployment; loại trừ `dist`, `.nx`, coverage và generated files khỏi quyết định xóa.
- Với mỗi legacy module/dependency, ghi trạng thái: `giữ`, `thay thế`, `xóa sau cutover`, hoặc `deferred`.
- Chốt danh sách API, event và database field cần tương thích trong thời gian chuyển đổi.

**Điều kiện hoàn tất:** mỗi service/client có mapping rõ ràng; không có yêu cầu “xóa ngay” thiếu consumer scan hoặc rollback plan.

Trong lúc package chưa resolve được từ môi trường, chỉ tiếp tục thay đổi consumer không cần package mới; tạm giữ local BFF principal type ở Gateway, không thêm import tới package contracts chưa cài được.

### Phase B — Đồng bộ Backend

1. Đảm bảo services cài đúng phiên bản package đã phát hành và cùng dùng chuẩn auth/contracts; không thay toàn bộ service một lượt.
2. Đồng bộ Gateway và IAM trước: BFF session contract, callback/logout, profile `sub`, role và migration dữ liệu.
3. Đồng bộ Social API/client contract; chuyển event bền vững sang Outbox/Streams theo từng loại event và từng consumer.
4. Đồng bộ Media path và Media Worker theo luồng Social thực tế; giữ queue/storage chuyên biệt.
5. Đồng bộ Stories service mà không đổi domain đọc truyện; giữ các thay đổi feature cho client Stories ở trạng thái deferred.

**Điều kiện hoàn tất:** build/test service liên quan pass; JWT được verify trực tiếp tại service; dữ liệu user còn nguyên liên kết `sub`; event redelivery không gây xử lý lặp đối với consumer đã migrate.

### Phase C — Đồng bộ các Client trong phạm vi

- **Social:** hoàn tất session loading, guard, interceptor, API errors và pagination qua shared packages; xác nhận browser không lưu/đính kèm access hoặc refresh token.
- **IAM landing:** giữ public landing; login CTA dùng Gateway; bỏ auth UI cũ chỉ sau khi xác nhận không còn route được hỗ trợ.
- **Portfolio landing:** giữ public landing; bỏ auth code không được dùng bởi landing.
- Chỉ sau khi ba app trên ổn định mới lập phase riêng cho Video, Shop và Stories clients.

**Điều kiện hoàn tất:** build/test từng app; smoke test anonymous và authenticated flows; SSO/logout kiểm tra trên các app đang mở; giao diện landing không bị phụ thuộc vào API auth ngoài ý muốn.

### Phase D — Contract và xóa phần thừa

- Gỡ package/dependency legacy ở từng consumer đã migrate; cập nhật lockfile, docs, env examples và Docker/build config.
- Xóa adapter, route, schema hoặc auth UI không còn source reference; với database chỉ xóa sau backup, migration và xác nhận không có dữ liệu cần giữ.
- Chỉ xóa package legacy khỏi `platform` khi toàn workspace và consumer đã publish xác nhận không còn sử dụng; nếu còn consumer ngoài workspace thì giữ package và đánh dấu deprecation.
- Chạy build/test lại từ checkout sạch, không dựa vào `dist`, cache hoặc `node_modules` cũ.

**Điều kiện hoàn tất:** không còn import tới phần đã xóa; không còn cấu hình runtime/CI tham chiếu; lockfile sạch; rollback/cutover đã được ghi lại.

## 5. Tiêu chí Hoàn tất Toàn kế hoạch

- Backend services dùng đúng shared packages/contracts theo trách nhiệm; không còn hai implementation cùng làm một việc nếu không có lý do tương thích được ghi nhận.
- Social client dùng BFF cookie; IAM và Portfolio giữ landing gọn; client deferred không bị kéo vào feature scope.
- Legacy code/dependency chỉ bị xóa sau khi chứng minh không còn consumer và các kiểm tra liên quan pass.
- Build/test/smoke test chạy từ môi trường sạch cho các repo đã thay đổi; có migration/rollback cho dữ liệu, API và events.
- Mọi việc chưa thực hiện cho client deferred được ghi rõ là deferred, không bị xem là blocker của đợt đồng bộ hiện tại.