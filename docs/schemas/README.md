# Static Knowledge: Schemas & Data Contracts

Tập hợp tài liệu và định nghĩa dữ liệu (Data Schemas), mô hình cơ sở dữ liệu (Database Schemas) và hợp đồng sự kiện (Event Contracts) của toàn bộ hệ sinh thái **Reals Platform**.

---

## 1. Cơ sở Dữ liệu theo Dịch vụ (Database-per-Service)

Hệ thống áp dụng nguyên tắc **Database-per-Service**. Mỗi microservice quản lý một cơ sở dữ liệu PostgreSQL độc lập với schema riêng biệt:

| Dịch vụ | Cơ sở dữ liệu | Cổng Local | ORM / Migration Tool | Vị trí Schema trong Codebase |
|---|---|---|---|---|
| **IAM Service** | `iam_db` | `5433` | Prisma ORM | [`services/iam-service/prisma/schema.prisma`](../../services/iam-service/prisma/schema.prisma) |
| **Media Service** | `media_db` | `5434` | Prisma ORM | [`services/media-service/prisma/schema.prisma`](../../services/media-service/prisma/schema.prisma) |
| **Social Service** | `social_db` | `5435` | Prisma ORM | [`services/social-service/prisma/schema.prisma`](../../services/social-service/prisma/schema.prisma) |
| **Stories Service** | `stories_db` | `5436` | Prisma ORM (`@prisma/client-reading`) | [`services/stories-service/prisma/schema.prisma`](../../services/stories-service/prisma/schema.prisma) (Bản blueprint tại [`docs/skills/stories/schema.prisma`](../skills/stories/schema.prisma)) |

---

## 2. Event Contracts & Domain Events

Tất cả các sự kiện trao đổi giữa các vi dịch vụ (Inter-service Event Bus) được định nghĩa tập trung trong repository `platform/contracts/events` (`@daccuong-uit/platform-contracts-events`):

- **User Events:**
  - `user.created.v1`: Được phát hành bởi IAM Service khi người dùng đăng ký thành công. Subscribed bởi Social Service & Stories Service để khởi tạo user profile / author profile.
  - `user.updated.v1`: Cập nhật thông tin định danh, avatar, bio.
- **Media Events:**
  - `media.uploaded.v1`: Phát hành khi file upload lên MinIO thành công.
  - `media.transcoded.v1`: Phát hành bởi Media Worker khi video/audio hoàn tất nén/transcode.
- **Novel & Content Events:**
  - `novel.chapter.published.v1`: Phát hành khi chương truyện mới được xuất bản, kích hoạt gửi thông báo tới người theo dõi.
  - `novel.view.flushed.v1`: Lượt xem được tổng hợp và flush định kỳ vào database.

---

## 3. Quy chuẩn Quản lý Schema & Migration

1. **Tuyệt đối không cross-query**: Không service nào được phép query trực tiếp database của service khác. Mọi trao đổi dữ liệu bắt buộc qua HTTP REST (Edge Gateway) hoặc Event Bus.
2. **Migration an toàn**: Khi thay đổi schema database, luôn tạo migration file mới qua Prisma (`npx prisma migrate dev` hoặc `prisma db push` trong môi trường local) và commit vào version control.
3. **Generator độc lập**: Với các service có schema lớn như Stories Service, schema sử dụng custom output generator (ví dụ: `../node_modules/@prisma/client-reading`) để tránh xung đột với default Prisma client.
