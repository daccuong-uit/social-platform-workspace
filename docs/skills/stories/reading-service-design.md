# `reading-service` — Thiết kế lại Database & Modules cho Web App Truyện Chữ

> Đi kèm: `schema.prisma` (55 model, 30 enum). Tài liệu này giải thích cấu trúc, module, các quyết định thiết kế và cách chuyển dữ liệu từ `stories_db`.

---

## 1. Phạm vi thay đổi

| | Nội dung |
|---|---|
| **Giữ nguyên** | NestJS 10 + Fastify, Prisma 5, PostgreSQL, Redis cache, Redis Pub/Sub event bus, auth qua `X-User-ID`, `MediaResolverService`, response shape + `buildPagination()`, Zod config, health/Swagger/OTEL, cấu trúc thư mục `src/{config,health,common,modules}`, prefix `/api/v1` |
| **Bỏ** | `posts`, `reels`, `videos`, `groups`, `friendship`, `hashtags`, `profile` (legacy), `comments`/`reactions`/`bookmarks` kiểu social, `PrivacySettings`, `AccountSettings` |
| **Thiết kế lại** | Toàn bộ schema (tách DB riêng `reading_db`) và toàn bộ `modules/` |
| **Thêm vào `common/`** | `RolesGuard` + `@Roles()`, `@OptionalUser()` (cho độc giả chưa đăng nhập), outbox relayer, helper Redis (view counter, quota), `slugify` / `normalize-text` |

---

## 2. Cấu trúc thư mục

```
src/
├── main.ts
├── app.module.ts                       # nhập 20 business modules
├── config/app.config.ts                # Zod: + PAYMENT_*, VIEW_FLUSH_INTERVAL_MS, ...
├── health/
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts   # giữ nguyên
│   │   ├── optional-user.decorator.ts  # ★ mới — userId có thể undefined
│   │   └── roles.decorator.ts          # ★ mới
│   ├── guards/roles.guard.ts           # ★ mới — đọc role từ UserProfile (cache Redis 60s)
│   ├── events/
│   │   ├── event.module.ts             # giữ nguyên
│   │   └── outbox.relayer.ts           # ★ mới — publish OutboxEvent → Redis Pub/Sub
│   ├── modules/media-resolver.module.ts
│   ├── prisma/{prisma.module,prisma.service}.ts
│   ├── redis/                          # ★ view-counter, vote-quota, rate-limit
│   ├── services/media-resolver.service.ts
│   └── utils/                          # ★ slugify, normalize-text, pagination
└── modules/
    ├── users/  authors/  follow/  genres/
    ├── novels/  chapters/  reading/  library/
    ├── reviews/  comments/  reactions/  votes/
    ├── discovery/  search/  notifications/  announcements/
    ├── moderation/  analytics/  wallet/  earnings/
```

Mỗi module giữ pattern hiện tại: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`; thêm `*.listener.ts` (consume event) hoặc `*.jobs.ts` (cron/queue) khi cần. Endpoint quản trị đặt trong chính module đó dưới `/admin/*` và bảo vệ bằng `@Roles()`.

---

## 3. Danh sách module

| # | Module | Trách nhiệm | Model chính |
|---|---|---|---|
| 1 | `users` | Projection từ IAM, hồ sơ, cài đặt, giao diện đọc, chặn user; listener `user.*` | `UserProfile`, `UserSettings`, `ReaderPreference`, `UserBlock` |
| 2 | `authors` | Đăng ký làm tác giả, hồ sơ tác giả, dashboard tác giả | `AuthorProfile` |
| 3 | `follow` | Theo dõi truyện (nhận thông báo), theo dõi tác giả | `NovelFollow`, `AuthorFollow` |
| 4 | `genres` | Thể loại và nhãn chuẩn hoá | `Genre`, `Tag`, `NovelGenre`, `NovelTag` |
| 5 | `novels` | CRUD truyện, luồng duyệt/xuất bản, đồng tác giả/dịch giả, bản dịch | `Novel`, `NovelStats`, `NovelContributor` |
| 6 | `chapters` | Quyển, chương, nội dung, lịch đăng, lịch sử sửa, import hàng loạt, kiểm tra quyền đọc VIP | `Volume`, `Chapter`, `ChapterContent`, `ChapterRevision`, `ChapterImportJob` |
| 7 | `reading` | Tiến trình đọc, lịch sử đọc, bookmark/highlight | `ReadingProgress`, `ReadingHistory`, `ChapterBookmark` |
| 8 | `library` | Tủ sách (shelf hệ thống + tuỳ chỉnh, chia sẻ công khai) | `Shelf`, `ShelfItem` |
| 9 | `reviews` | Đánh giá sao + review, hữu ích, tác giả phản hồi | `NovelReview`, `ReviewHelpfulVote` |
| 10 | `comments` | Bình luận truyện / cuối chương / theo đoạn, reply 2 cấp, like, ghim | `Comment`, `CommentLike` |
| 11 | `reactions` | Cảm xúc theo chương | `ChapterReaction` |
| 12 | `votes` | Đề cử / nguyệt phiếu + quota | `NovelVote` |
| 13 | `discovery` | Trang chủ, trending, featured, BXH, truyện tương tự, gợi ý, huy hiệu, bộ sưu tập | `NovelBadge`, `Collection`, `CollectionItem`, `NovelSimilarity`, `RankingSnapshot` |
| 14 | `search` | Tìm truyện/tác giả, gợi ý, từ khoá hot, lịch sử tìm kiếm | `SearchHistory`, `SearchKeyword` (+ `Novel.searchText`) |
| 15 | `notifications` | Thông báo in-app / email / web push, tuỳ chọn nhận | `Notification`, `NotificationPreference`, `PushSubscription` |
| 16 | `announcements` | Thông báo của tác giả theo truyện + thông báo toàn hệ thống | `Announcement` |
| 17 | `moderation` | Báo cáo vi phạm, hàng đợi duyệt, nhật ký kiểm duyệt, cấm bình luận | `Report`, `ModerationAction` |
| 18 | `analytics` | Flush view từ Redis, thống kê theo ngày cho tác giả | `NovelStatDaily`, `ChapterStatDaily` |
| 19 | `wallet` | Ví xu, nạp xu, mở khoá chương VIP, tặng quà/donate | `Wallet`, `WalletTransaction`, `TopUpPackage`, `TopUpOrder`, `ChapterUnlock`, `Gift`, `Donation` |
| 20 | `earnings` | Doanh thu tác giả, yêu cầu rút tiền | `AuthorEarning`, `PayoutRequest` |

Hạ tầng dùng chung: `OutboxEvent` (trong `common/events`).

### Ánh xạ module cũ → mới

| Cũ (`stories-service`) | Mới |
|---|---|
| `novels` (gộp cả chapter/follow/rating/progress) | Tách thành `novels`, `chapters`, `follow`, `reviews`, `reading`, `library` |
| `users` | `users` (+ `authors`) |
| `follow` | `follow` (bỏ trạng thái PENDING; thêm follow truyện) |
| `comments` | `comments` (gắn thẳng vào truyện/chương/đoạn) |
| `reactions` | `reactions` (chỉ chương) + `votes` |
| `bookmarks` | `library` + `reading` (bookmark trong chương) |
| `notifications` | `notifications` |
| `analytics` | `analytics` |
| `hashtags` | `genres` (Genre/Tag chuẩn hoá) + `search` (từ khoá hot) |
| `search` | `search` |
| `posts`, `reels`, `videos`, `groups`, `friendship`, `profile` | Bỏ |

---

## 4. Mô hình dữ liệu

```
UserProfile ─┬─ AuthorProfile
             ├─ UserSettings / ReaderPreference
             └─ AuthorFollow (follower → author)

Genre ─┐
Tag ───┼─ Novel ─┬─ NovelStats (counter nóng)         ┌─ ChapterContent (body)
       │         ├─ NovelContributor                  ├─ ChapterRevision
       │         ├─ Volume ── Chapter ────────────────┼─ ChapterReaction
       │         │              │                     ├─ ChapterUnlock ── (xu)
       │         │              │                     └─ ChapterStatDaily
       │         ├─ NovelReview ── ReviewHelpfulVote
       │         ├─ Comment (novel / chương / đoạn) ── CommentLike
       │         ├─ NovelVote · NovelBadge · NovelSimilarity · RankingSnapshot
       │         ├─ NovelFollow · ShelfItem ── Shelf
       │         └─ Announcement · ChapterImportJob · NovelStatDaily
       └─ Novel.sourceNovelId → Novel (bản dịch)

ReadingProgress (user × novel) · ReadingHistory (user × chapter) · ChapterBookmark

Wallet ── WalletTransaction (ledger bất biến)
TopUpPackage ── TopUpOrder · Gift ── Donation · AuthorEarning ── PayoutRequest
```

### Quyết định thiết kế chính

| Quyết định | Lý do | Đánh đổi |
|---|---|---|
| `NovelStats` tách khỏi `Novel` | Counter đổi liên tục; tách ra thì `Novel` (dữ liệu catalog) ít bị ghi, ít bloat, ít lock | Thêm 1 join khi list; Prisma hỗ trợ `orderBy: { stats: { hotScore: 'desc' } }` nên dùng vẫn gọn |
| `ChapterContent` tách khỏi `Chapter` | Mục lục truyện 2000+ chương không kéo theo hàng GB text | Đọc chương cần 2 bảng (1-1, PK lookup) |
| `Novel.nextChapterOrder` + `Chapter.orderIndex` (unique) | Sửa race condition của `chapterCount + 1`: `UPDATE ... nextChapterOrder + 1 RETURNING` khoá dòng Novel nên các insert đồng thời được tuần tự hoá | `orderIndex` không dùng lại khi xoá chương (có khoảng trống) — không sao vì hiển thị dùng `chapterNumber` |
| `chapterNumber` (Float) tách khỏi `orderIndex` | Hỗ trợ "Chương 12.5", ngoại truyện, đánh số lại mà không đụng khoá sắp xếp | Phải validate ở DTO |
| `publishStatus` tách khỏi `visibility` | Có DRAFT / duyệt / gỡ vi phạm độc lập với việc công khai hay không | Điều kiện public = `PUBLISHED` + `PUBLIC/UNLISTED` + `deletedAt IS NULL`; gói vào 1 helper `publicNovelWhere()` |
| Bản dịch = `Novel` riêng có `sourceNovelId` | Mỗi bản dịch có chương/comment/doanh thu riêng; tránh bảng dịch từng chương phức tạp | Không tự đồng bộ chương giữa các bản |
| `Comment` một bảng với `chapterId` / `paragraphIndex` nullable | Có FK thật (khác polymorphic `targetType`), 1 index phục vụ cả 3 kiểu bình luận | `paragraphIndex` lệch nếu tác giả sửa mạnh nội dung — chấp nhận, hiển thị theo best-effort |
| Reply tối đa 2 cấp | Truy vấn đơn giản, UI dễ; không cần đệ quy | Không có thread sâu |
| Rating: `ratingSum` + `ratingCount` cập nhật theo delta | Bỏ `aggregate()` mỗi lần rate; `ratingAvg` tính trong cùng câu UPDATE | `ratingScore` (Bayesian) do job cập nhật định kỳ, hơi trễ |
| Review = rating (1 bảng `NovelReview`) | Mỗi user 1 dòng/truyện; điểm chi tiết (cốt truyện, nhân vật, thế giới, văn phong) là cột tuỳ chọn | Muốn "chỉ rate không review" thì `content` để null |
| Ledger `WalletTransaction` bất biến + `idempotencyKey` unique | Chống trừ/cộng xu 2 lần khi double-click hoặc webhook gửi lại | Sửa sai phải bằng giao dịch bù (`REFUND` / `ADJUSTMENT`) |
| `AuthorEarning` có `availableAt` | Giữ tiền vài ngày để chống hoàn/chargeback trước khi cho rút | Thêm 1 job chuyển `PENDING → AVAILABLE` |
| Transactional outbox | Redis Pub/Sub không lưu tin: subscriber chết là mất event. Với thông báo chương mới và doanh thu không được phép mất | Thêm bảng + relayer; đảm bảo at-least-once nên consumer phải idempotent (`Notification.dedupeKey`) |
| FK tới `UserProfile` chỉ ở bảng cần hiển thị | Projection có thể đến trễ so với request đầu tiên của user; FK ở bảng lớn (history, ledger) dễ gây lỗi và tốn chi phí | Bảng không FK cần dọn thủ công khi user bị xoá (xử lý qua event `user.deleted.v1`) |

### Đối tượng DB nằm ngoài Prisma (đặt trong migration SQL đầu tiên)

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE "NovelReview" ADD CONSTRAINT review_rating_range
  CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "Wallet" ADD CONSTRAINT wallet_balance_nonneg CHECK ("balance" >= 0);
ALTER TABLE "Chapter" ADD CONSTRAINT chapter_price_nonneg CHECK ("priceCoins" >= 0);
ALTER TABLE "NovelContributor" ADD CONSTRAINT contributor_share_range
  CHECK ("revenueShareBps" BETWEEN 0 AND 10000);

-- Mỗi user chỉ có 1 shelf hệ thống mỗi loại
CREATE UNIQUE INDEX shelf_system_unique ON "Shelf" ("userId", "type") WHERE "type" <> 'CUSTOM';

-- Index cho danh sách công khai, bỏ qua dòng đã xoá mềm
CREATE INDEX novel_public_latest_idx ON "Novel" ("lastChapterAt" DESC)
  WHERE "deletedAt" IS NULL AND "publishStatus" = 'PUBLISHED' AND "visibility" = 'PUBLIC';
```

Prisma không biết `CHECK` và partial index; sau khi thêm hãy chạy `prisma migrate diff` để chắc chắn nó không đề xuất xoá chúng.

---

## 5. API theo module

Ký hiệu quyền: **P** công khai · **U** đăng nhập · **A** tác giả/đồng tác giả của truyện · **M** moderator/admin · **AD** admin.
Giữ nguyên prefix `/api/v1`, response shape, pagination `page/pageSize` (mặc định 20, tối đa 50). Truyện nhận cả `:novelId` (uuid) lẫn `slug`.

### users · authors · follow

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/users/:username` | P | Hồ sơ công khai |
| GET / PATCH | `/me` | U | Hồ sơ của tôi |
| GET / PUT | `/me/settings` | U | Ngôn ngữ, lọc 18+, riêng tư |
| GET / PUT | `/me/reader-preferences` | U | Font, cỡ chữ, giãn dòng, theme |
| GET | `/me/blocks` | U | Danh sách đã chặn |
| POST / DELETE | `/users/:userId/block` | U | Chặn / bỏ chặn |
| GET | `/authors/:userId` | P | Hồ sơ tác giả |
| GET | `/authors/:userId/novels` | P | Truyện của tác giả |
| POST / PATCH | `/me/author` | U | Đăng ký / sửa hồ sơ tác giả |
| GET | `/me/author/novels` | A | Truyện của tôi (mọi trạng thái) |
| POST / PATCH / DELETE | `/novels/:novelId/follow` | U | Theo dõi / bật-tắt thông báo / bỏ theo dõi |
| POST / DELETE | `/authors/:userId/follow` | U | Theo dõi tác giả |
| GET | `/me/following/novels` | U | Truyện đang theo dõi (kèm số chương chưa đọc) |
| GET | `/me/following/authors` | U | Tác giả đang theo dõi |

### genres · novels

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/genres` | P | Danh sách thể loại + số truyện |
| GET | `/genres/:slug/novels` | P | Truyện theo thể loại |
| GET | `/tags?q=` · `/tags/:slug/novels` | P | Tìm nhãn · truyện theo nhãn |
| GET | `/novels` | P | Lọc: `genre, tag, status, origin, ageRating, language, minChapters, sort` |
| GET | `/novels/latest` · `/novels/new` · `/novels/completed` | P | Mới cập nhật · mới đăng · đã hoàn thành |
| GET | `/novels/:idOrSlug` | P | Chi tiết (không tăng view — view tính ở chương) |
| POST | `/novels` | U(AUTHOR) | Tạo truyện (mặc định DRAFT) |
| PATCH / DELETE | `/novels/:novelId` | A | Sửa / xoá mềm |
| POST | `/novels/:novelId/submit` | A | Gửi duyệt |
| GET / POST / PATCH / DELETE | `/novels/:novelId/contributors[/:userId]` | A | Quản lý đồng tác giả, dịch giả |
| GET | `/novels/:novelId/translations` | P | Các bản dịch |
| GET | `/admin/novels/pending` | M | Hàng đợi duyệt |
| POST | `/admin/novels/:novelId/{approve,reject,takedown}` | M | Duyệt / từ chối / gỡ |
| POST / PATCH / DELETE | `/admin/{genres,tags}` · `/admin/tags/merge` | AD | Quản trị taxonomy |

### chapters · reading · library

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET / POST / PATCH / DELETE | `/novels/:novelId/volumes[/:volumeId]` | P/A | Quyển |
| GET | `/novels/:novelId/chapters` | P | Mục lục (không trả nội dung; kèm `isRead`, `isLocked` nếu đã đăng nhập) |
| GET | `/novels/:novelId/chapters/:chapterId` | P | Đọc chương (kèm prev/next; chương VIP chưa mở → chỉ trả đoạn xem trước, `locked: true`) |
| GET | `/novels/:novelId/chapters/by-order/:orderIndex` | P | Đọc theo thứ tự (URL thân thiện SEO) |
| POST | `/novels/:novelId/chapters` | A | Tạo chương: `publishMode = draft \| now \| schedule` |
| PATCH / DELETE | `/novels/:novelId/chapters/:chapterId` | A | Sửa (ghi revision) / xoá mềm |
| POST | `…/chapters/:chapterId/{publish,schedule}` | A | Đăng ngay / hẹn giờ |
| POST | `/novels/:novelId/chapters/reorder` | A | Sắp xếp lại |
| PATCH | `/novels/:novelId/chapters/bulk-pricing` | A | Đặt giá / `freeAt` hàng loạt |
| GET / POST | `…/chapters/:chapterId/revisions[/:no/restore]` | A | Lịch sử sửa, khôi phục |
| POST | `/novels/:novelId/chapters/import` | A | Tạo job import (file đã upload qua media-service) |
| GET | `/novels/:novelId/imports/:jobId` | A | Trạng thái import |
| PUT | `…/chapters/:chapterId/progress` | U | Lưu tiến trình (giữ nguyên endpoint cũ) |
| GET | `/me/reading/continue` | U | "Đọc tiếp" |
| GET / DELETE | `/me/history` · `/me/history/:novelId` | U | Lịch sử đọc |
| GET / POST / PATCH / DELETE | `/me/bookmarks[/:id]` | U | Bookmark, highlight, ghi chú |
| GET | `/me/library` | U | Tủ sách (thay cho `/novels/me/library`) |
| GET / POST | `/me/shelves` | U | Danh sách / tạo shelf |
| PATCH / DELETE | `/me/shelves/:shelfId` | U | Sửa / xoá shelf tuỳ chỉnh |
| POST / DELETE | `/me/shelves/:shelfId/novels[/:novelId]` | U | Thêm / bỏ truyện |
| PUT | `/me/novels/:novelId/shelf` | U | Chuyển giữa các shelf trạng thái (đang đọc / muốn đọc / đã đọc / bỏ) |
| GET | `/shelves/:shelfId` | P | Xem shelf công khai |

### reviews · comments · reactions · votes

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/novels/:novelId/reviews` | P | Sắp xếp `helpful \| newest`, lọc theo sao |
| GET | `/novels/:novelId/reviews/summary` | P | Phân bố 1–5 sao + điểm trung bình |
| POST / DELETE | `/novels/:novelId/rate` | U | Tạo/sửa (upsert) / xoá đánh giá — giữ endpoint cũ |
| POST / DELETE | `/reviews/:reviewId/helpful` | U | Đánh dấu hữu ích |
| POST | `/reviews/:reviewId/reply` | A | Tác giả phản hồi |
| GET | `/novels/:novelId/comments` | P | Bình luận trang truyện |
| GET | `…/chapters/:chapterId/comments?paragraph=` | P | Bình luận cuối chương / theo đoạn |
| GET | `…/chapters/:chapterId/comments/paragraph-counts` | P | Số bình luận mỗi đoạn |
| POST | `/novels/:novelId/comments` · `…/chapters/:chapterId/comments` | U | Đăng bình luận (kiểm tra `commentBannedUntil`) |
| GET | `/comments/:commentId/replies` | P | Reply |
| PATCH / DELETE | `/comments/:commentId` | U | Sửa / xoá (chủ comment hoặc M) |
| POST / DELETE | `/comments/:commentId/like` | U | Like |
| POST | `/comments/:commentId/pin` | A | Ghim |
| PUT / DELETE | `…/chapters/:chapterId/reaction` | U | Cảm xúc theo chương |
| GET | `…/chapters/:chapterId/reactions` | P | Tổng hợp cảm xúc |
| POST | `/novels/:novelId/votes` | U | Đề cử / nguyệt phiếu `{type, quantity}` |
| GET | `/me/votes/quota` | U | Quota còn lại hôm nay / tháng này |
| GET | `/novels/:novelId/votes/top-voters` | P | BXH người ủng hộ |

### discovery · search · notifications · announcements · moderation · analytics

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/discovery/home` | P | Các section trang chủ |
| GET | `/novels/trending` · `/novels/featured` | P | Trending · nổi bật (biên tập) |
| GET | `/rankings?metric=&period=` | P | BXH đọc nhiều / đề cử / nguyệt phiếu / điểm / theo dõi |
| GET | `/novels/:novelId/recommendations` | P | Truyện tương tự |
| GET | `/me/recommendations` | U | Gợi ý theo thể loại đã đọc |
| GET | `/collections` · `/collections/:slug` | P | Bộ sưu tập biên tập |
| POST / PUT / DELETE | `/admin/collections[/:id]` · `/admin/novels/:novelId/badges` | M | Quản trị bộ sưu tập, huy hiệu |
| GET | `/search/novels` | P | Full-text + bộ lọc |
| GET | `/search/suggest?q=` · `/search/trending-keywords` · `/search/authors` | P | Gợi ý · từ khoá hot · tìm tác giả |
| GET / DELETE | `/me/search-history` | U | Lịch sử tìm kiếm |
| GET | `/me/notifications` · `/me/notifications/unread-count` | U | Danh sách · số chưa đọc |
| PATCH / POST | `/me/notifications/:id/read` · `/me/notifications/read-all` | U | Đánh dấu đã đọc |
| GET / PUT | `/me/notification-preferences` | U | Bật/tắt theo loại × kênh |
| POST / DELETE | `/me/push-subscriptions` | U | Đăng ký web push |
| GET | `/novels/:novelId/announcements` · `/announcements` | P | Thông báo của truyện · toàn hệ thống |
| POST / PATCH / DELETE | `/novels/:novelId/announcements[/:id]` | A | Quản lý thông báo tác giả |
| POST | `/reports` | U | Báo cáo truyện/chương/bình luận/review/user |
| GET / PATCH | `/admin/reports[/:id]` | M | Xử lý báo cáo |
| POST | `/admin/moderation/actions` · `/admin/users/:userId/comment-ban` | M | Hành động kiểm duyệt |
| GET | `/statistics/novels/:novelId?from=&to=` | A | Lượt xem, người đọc, follow, vote, doanh thu theo ngày |
| GET | `/statistics/novels/:novelId/chapters` | A | Thống kê từng chương (tỉ lệ đọc xong, điểm rớt) |
| GET | `/me/author/statistics/overview` | A | Tổng quan mọi truyện của tác giả |

### wallet · earnings

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/me/wallet` · `/me/wallet/transactions` | U | Số dư · lịch sử giao dịch |
| GET | `/wallet/packages` | P | Gói nạp xu |
| POST | `/wallet/topups` | U | Tạo đơn nạp → trả URL cổng thanh toán |
| POST | `/payments/webhooks/:provider` | Public + chữ ký | Callback cổng thanh toán (đi vòng qua xác thực gateway, tự verify signature) |
| POST | `/novels/:novelId/chapters/:chapterId/unlock` | U | Mở khoá 1 chương |
| POST | `/novels/:novelId/unlock-range` | U | Mở khoá nhiều chương một lần |
| GET | `/gifts` · POST `/novels/:novelId/donations` | P / U | Danh mục quà · tặng quà |
| GET | `/me/earnings/summary` · `/me/earnings` | A | Doanh thu, chi tiết theo truyện |
| GET / POST | `/me/payouts` | A | Lịch sử · yêu cầu rút |
| GET / PATCH | `/admin/payouts[/:id]` | AD | Duyệt rút tiền |

---

## 6. Các luồng xử lý quan trọng

### 6.1 Đếm lượt xem (thay fire-and-forget ghi thẳng DB)

```
GET chapter ──► SET view:{chapterId}:{viewerKey} NX EX 1800     (viewerKey = userId hoặc hash(IP+UA))
                    │ đặt được?
                    ├─ yes → HINCRBY views:pending {chapterId} 1 · PFADD uniq:{chapterId}:{date} {viewerKey}
                    └─ no  → bỏ qua (chống spam F5)

Job mỗi 30–60s: RENAME views:pending → views:flushing (tránh mất số) → 1 transaction:
   Chapter.viewCount += n · NovelStats.viewCount += Σn · ChapterStatDaily / NovelStatDaily upsert
```

Gateway cần forward `X-Forwarded-For` để tính `viewerKey` cho độc giả ẩn danh.

### 6.2 Cấp số thứ tự chương (hết race condition)

```ts
await prisma.$transaction(async (tx) => {
  const { nextChapterOrder } = await tx.novel.update({
    where: { id: novelId },
    data: { nextChapterOrder: { increment: 1 } },
    select: { nextChapterOrder: true },
  });
  const orderIndex = nextChapterOrder - 1;   // dòng Novel bị khoá tới hết transaction
  // tạo Chapter + ChapterContent (+ ChapterRevision #1) ở đây
});
```

`NovelStats.chapterCount/wordCount` và `Novel.lastChapterAt` chỉ cập nhật khi chương chuyển sang `PUBLISHED`.

### 6.3 Đăng chương hẹn giờ + thông báo chương mới

1. Cron mỗi phút: chọn chương `status = SCHEDULED AND scheduledAt <= now()` bằng `FOR UPDATE SKIP LOCKED` → `PUBLISHED`, cập nhật thống kê, ghi `OutboxEvent chapter.published.v1` (cùng transaction).
2. Consumer duyệt `NovelFollow` theo cursor 1.000 dòng/lượt với `notifyNewChapter = true`, `createMany` vào `Notification` (`dedupeKey = chapter:{chapterId}`), rồi đẩy email/push qua queue.
3. Trang "truyện theo dõi vừa cập nhật" là **pull**: join `NovelFollow` với `Novel.lastChapterAt` và `ReadingProgress` — không cần ghi 100k dòng cho truyện lớn.

### 6.4 Mở khoá chương VIP (một transaction, idempotent)

```
1. Kiểm tra: chương PAID, chưa unlock, chưa qua freeAt, người dùng không phải tác giả/đồng tác giả
2. UPDATE Wallet SET balance = balance - :price, lifetimeSpent = lifetimeSpent + :price
      WHERE userId = :u AND balance >= :price          → 0 dòng bị ảnh hưởng ⇒ 402 INSUFFICIENT_COINS
3. INSERT WalletTransaction (idempotencyKey = 'unlock:{userId}:{chapterId}')
4. INSERT ChapterUnlock
5. INSERT AuthorEarning × mỗi người thụ hưởng (chia theo revenueShareBps; chủ truyện nhận phần còn lại)
6. INSERT OutboxEvent
```

Nạp xu: `TopUpOrder(PENDING)` → cổng thanh toán → webhook (verify chữ ký) → `UPDATE ... SET status='SUCCEEDED' WHERE id=? AND status='PENDING'` (chỉ 1 webhook thắng) → cộng ví + ghi ledger `topup:{orderId}`.

Trả chương chưa mở khoá: **không** gửi toàn bộ nội dung xuống client; chỉ trả `previewParagraphs` đầu tiên.

### 6.5 Đánh giá

Trong transaction: đọc rating cũ (nếu có) → tính delta → một câu UPDATE `NovelStats` (`ratingSum`, `ratingCount`, `ratingAvg = ratingSum / ratingCount`). Job mỗi giờ tính `ratingScore` (Bayesian) để xếp hạng:

```
ratingScore = (v / (v + m)) · R + (m / (v + m)) · C
  v = ratingCount, R = ratingAvg, m = 20 (ngưỡng tối thiểu), C = điểm trung bình toàn site
```

### 6.6 Trending

Job mỗi 10–15 phút đọc `NovelStatDaily` 7 ngày gần nhất:

```
hotScore = Σ_ngày  decay^(tuổi ngày) · ( views·1 + uniqueReaders·3 + newFollows·10
                    + votes·8 + newReviews·5 + newComments·2 + chapterUnlocks·6 )
decay = 0.7
```

Ghi vào `NovelStats.hotScore` và Redis ZSET `rank:HOT:DAILY:{key}`; cuối kỳ chụp `RankingSnapshot`. Trọng số ở trên là điểm khởi đầu, nên cấu hình được để chỉnh theo dữ liệu thật.

### 6.7 Tìm kiếm

- `Novel.searchText` = title + altTitles + penName, **bỏ dấu** (`NFD` → xoá dấu, `đ→d`) và lowercase, ghi lại mỗi khi các trường đó đổi.
- Query cũng chuẩn hoá cùng cách rồi dùng `pg_trgm` (`ILIKE '%q%'` + `similarity()`) qua `$queryRaw`; chỉ trả truyện public.
- `/search/suggest` dùng `SearchKeyword` + GIN trgm; mỗi lượt tìm tăng `searchCount` qua Redis rồi flush batch.
- Nếu sau này cần typo-tolerance, synonym, facet nhiều chiều: thêm Meilisearch/OpenSearch và giữ module `search` làm lớp bọc, không đổi API.

### 6.8 Quyền đọc chương (tóm tắt)

Được đọc đủ nội dung khi: chương `FREE` · hoặc `freeAt` đã qua · hoặc có `ChapterUnlock` · hoặc là chủ truyện/contributor · hoặc là M/AD. Chương `DRAFT/SCHEDULED` chỉ tác giả xem được.

---

## 7. Event

**Consume** (đăng ký trong `UserEventListenersService.onModuleInit()` như hiện tại)

| Topic | Hành động |
|---|---|
| `user.created.v1` | Tạo `UserProfile` (upsert, idempotent) — giữ nguyên |
| `user.updated.v1` *(cần IAM xác nhận)* | Đồng bộ username, displayName, avatar |
| `user.role-changed.v1` *(cần IAM xác nhận)* | Cập nhật `UserProfile.role`, xoá cache `user:role:{id}` |
| `user.deleted.v1` *(cần IAM xác nhận)* | Ẩn danh hoá dữ liệu người dùng |

Nếu request đến trước khi `user.created.v1` kịp xử lý, service upsert một `UserProfile` tối thiểu từ `X-User-ID` (lazy provisioning); event đến sau sẽ bổ sung thông tin đầy đủ.

**Publish** (qua `OutboxEvent`): `novel.published.v1`, `novel.status-changed.v1`, `chapter.published.v1`, `review.created.v1`, `comment.created.v1`, `wallet.topup-succeeded.v1`, `donation.created.v1`, `payout.updated.v1`. Định nghĩa contract mới trong `@daccuong-uit/contracts-events`.

---

## 8. Cache (Redis)

| Key | TTL | Vô hiệu khi |
|---|---|---|
| `novel:detail:{slug}` | 60s | Sửa truyện, đổi thống kê lớn |
| `novel:chapters:{novelId}` | 5 phút | Đăng / xoá / sắp xếp chương |
| `chapter:body:{chapterId}` | 1 giờ | Sửa chương (chỉ cache chương FREE) |
| `chapter:para-counts:{chapterId}` | 60s | — |
| `genres:all` | 10 phút | Sửa taxonomy |
| `home:sections` | 2 phút | — |
| `novel:similar:{novelId}` | 1 giờ | Job tính lại |
| `user:role:{userId}` | 60s | Event `user.role-changed.v1` |
| `rank:{metric}:{period}:{key}` (ZSET) | Theo kỳ | Job ranking |
| `views:pending`, `view:{chapterId}:{viewerKey}` | Xem 6.1 | — |
| `vote-quota:{userId}:{type}:{periodKey}` | Hết kỳ | — |

---

## 9. Chuyển dữ liệu từ `stories_db`

| Nguồn | Đích | Ghi chú |
|---|---|---|
| `Novel` | `Novel` + `NovelStats` | `slug` tạo từ title (thêm hậu tố ngắn nếu trùng). `PUBLIC` → `PUBLISHED/PUBLIC`. `PRIVATE` → `DRAFT/PRIVATE` *(giả định — xem mục 10)*. `nextChapterOrder = max(orderIndex)+1`, `lastChapterAt = max(Chapter.createdAt)` |
| `Novel.genres[]`, `Novel.tags[]` | `Genre`, `Tag`, `NovelGenre`, `NovelTag` | Lấy distinct, chuẩn hoá và gộp trùng bằng tay trước khi nạp; genre đầu tiên → `isPrimary` |
| `Chapter` | `Chapter` + `ChapterContent` | `status = PUBLISHED`, `chapterNumber = orderIndex`, `wordCount` tính lại từ nội dung |
| `NovelFollow` | `NovelFollow` | `notifyNewChapter = true` |
| `NovelRating` | `NovelReview` | `review` → `content`; tính lại `NovelStats.rating*` |
| `ReadingProgress` | `ReadingProgress` + 1 dòng `ReadingHistory` | `progressPercent` → `scrollPercent` |
| `Bookmark(NOVEL)` | `ShelfItem` vào shelf `FAVORITES` | Shelf hệ thống tạo lười khi migrate |
| `Bookmark(CHAPTER)` | `ChapterBookmark` | — |
| `Reaction(CHAPTER)` | `ChapterReaction` | `CARE → LOVE` |
| `UserProfile` | `UserProfile` | Chỉ những user có truyện hoặc hoạt động đọc; còn lại tự tạo khi phát sinh (lazy) |
| `Notification`, `Comment`, mọi thứ social | — | Không chuyển. `Comment` cũ chỉ gắn `postId/reelId`, không có bình luận chương để chuyển |

Kế hoạch triển khai: (1) dựng `reading-service` chạy song song, (2) chạy script migrate một lần và đối soát số lượng, (3) đóng băng ghi vào `novels` của `stories-service`, chạy migrate delta, (4) đổi route gateway `/novels*`, `/me/library` sang `reading-service`, giữ alias `/novels/me/library` trong một phiên bản, (5) gỡ module `novels` khỏi `stories-service` và dọn các `targetType = NOVEL/CHAPTER` ở `Reaction`/`Bookmark`.

---

## 10. Giả định cần xác nhận

1. **Tên & hạ tầng**: `reading-service`, DB `reading_db`, biến `READING_DATABASE_URL`, port `3006` (3005 đang là `stories-service`).
2. **Kiểu id**: schema dùng `uuid`. Nếu IAM/stories đang dùng `cuid`, đổi `@db.Uuid` + `@default(uuid())` cho khớp.
3. **Role**: lấy từ IAM và đồng bộ vào `UserProfile.role` qua event (giữ nguyên hợp đồng gateway chỉ inject `X-User-ID`). Nếu IAM chưa phát event role, cần bổ sung hoặc cho gateway inject thêm `X-User-Roles`.
4. **Độc giả ẩn danh**: gateway phải cho phép các `GET` công khai đi qua **không** có `X-User-ID` và forward `X-Forwarded-For`.
5. **Truyện `PRIVATE` cũ** map sang `DRAFT/PRIVATE`. Nếu đang dùng như "ẩn khỏi danh sách nhưng đã có độc giả", đổi thành `PUBLISHED/PRIVATE`.
6. **Thêm 2 dependency**: `@nestjs/schedule` (cron) và BullMQ (queue, dùng Redis sẵn có) cho fan-out thông báo, import chương, flush thống kê.
7. **Thanh toán**: chưa chọn cổng. `provider` là chuỗi tự do; mỗi cổng cần một adapter và bước verify chữ ký riêng. `PayoutRequest.payoutAccountRef` chỉ giữ tham chiếu — thông tin tài khoản nhận tiền nên lưu mã hoá ở nơi khác.
8. **Phạm vi tiền tệ**: nếu bán xu/rút tiền thật thì nên rà soát yêu cầu pháp lý và kế toán trước khi mở; cân nhắc tách `wallet` + `earnings` thành `payment-service` riêng khi có kiểm toán.

## 11. Nên xem lại khi hệ thống lớn lên

| Khi | Việc cần làm |
|---|---|
| `ChapterContent` vượt ~50–100 GB | Chuyển `body` sang object storage (qua media-service), giữ `contentHash` + key trong DB |
| `ReadingHistory`, `Notification`, `*StatDaily` phình to | Partition theo tháng / hash `userId`; `Notification` xoá sau 90 ngày; `ChapterRevision` chỉ giữ ~20 bản gần nhất |
| Trang duyệt truyện chậm | Read replica cho các endpoint `GET` công khai |
| Nhu cầu tìm kiếm phức tạp | Thêm Meilisearch/OpenSearch (mục 6.7) |
| Gợi ý cá nhân hoá | Thay rule-based bằng collaborative filtering / embedding; bảng `NovelSimilarity` có thể giữ làm nguồn ứng viên |
| Nhiều instance chạy job | Đảm bảo cron dùng khoá phân tán (Redis lock) hoặc chỉ chạy ở worker riêng |
