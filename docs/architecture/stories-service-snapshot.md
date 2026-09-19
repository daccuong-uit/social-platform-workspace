# Snapshot: `stories-service` — Baseline Analysis

> **Mục đích**: Tài liệu này là snapshot toàn diện về `stories-service` hiện tại trong `social-platform-workspace`. Được dùng để lên kế hoạch xây dựng một **dedicated web app truyện chữ** (`reading-service`) với đầy đủ tính năng.

---

## 1. Tổng quan kỹ thuật

| Hạng mục | Giá trị |
|---|---|
| **Service name** | `@app/stories-service` |
| **Port** | `3005` |
| **Framework** | NestJS 10 + Fastify adapter |
| **ORM** | Prisma 5 (`@prisma/client-stories`) |
| **Database** | PostgreSQL (dedicated DB: `stories_db`) |
| **Cache** | Redis (via `@daccuong-uit/platform-cache`) |
| **Event Bus** | Redis Pub/Sub (via `@daccuong-uit/platform-event-bus`) |
| **Auth model** | Stateless — gateway inject `X-User-ID` header |
| **Media** | Không truy cập trực tiếp MinIO; gọi `MEDIA_SERVICE_URL` để resolve presigned URLs |
| **Observability** | OpenTelemetry tracing (`@daccuong-uit/platform-tracing`), custom logger |
| **API prefix** | `GET /api/v1/*` (health endpoint không có prefix) |
| **Swagger** | `GET /docs` |

### Shared Platform Libraries
```
@daccuong-uit/platform-http-common   — AllExceptionsFilter, TransformInterceptor
@daccuong-uit/platform-event-bus     — EventBusService (Redis Pub/Sub)
@daccuong-uit/contracts-events       — DomainEvent contracts, isUserCreatedEvent
@daccuong-uit/platform-config        — loadConfig, BaseEnvSchema (Zod-based)
@daccuong-uit/platform-logger        — createLogger
@daccuong-uit/platform-tracing       — initTracing (OTEL)
@daccuong-uit/platform-cache         — Redis cache client
```

---

## 2. Cấu trúc thư mục (Source)

```
src/
├── main.ts                        # Bootstrap: Fastify, Swagger, ValidationPipe, CORS
├── app.module.ts                  # Root module — nhập 16 modules
├── config/
│   └── app.config.ts              # Zod schema: PORT, DATABASE_URL, REDIS_*, CORS_ORIGIN
├── health/
│   ├── health.module.ts
│   └── health.controller.ts       # GET /health
├── common/
│   ├── decorators/
│   │   └── current-user.decorator.ts   # @CurrentUser() — lấy X-User-ID header
│   ├── events/
│   │   └── event.module.ts             # EventModule — provide EventBusService
│   ├── modules/
│   │   └── media-resolver.module.ts    # Global module wrap MediaResolverService
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── redis/                          # (thư mục tồn tại, chưa liệt kê nội dung)
│   ├── services/
│   │   └── media-resolver.service.ts   # HTTP call đến media-service
│   └── utils/                          # (thư mục tồn tại)
└── modules/
    ├── users/        # UserProfile CRUD + event listener (user.created.v1)
    ├── follow/       # Follow/Unfollow user
    ├── friendship/   # Friend requests
    ├── posts/        # Social posts (text, image, poll, repost...)
    ├── comments/     # Comments + replies + likes
    ├── reactions/    # Emoji reactions (LIKE, SAD, ANGRY, CARE)
    ├── bookmarks/    # Bookmark posts/reels/videos/novels/chapters
    ├── notifications/ # In-app notifications
    ├── reels/        # Short-form videos
    ├── videos/       # Long-form videos + playlists + watch history
    ├── novels/       # ★ Module truyện (xem chi tiết mục 4)
    ├── analytics/    # Analytics/stats
    ├── hashtags/     # Hashtag trending
    ├── search/       # Search
    ├── groups/       # Groups
    └── profile/      # (Legacy — replaced by users module)
```

---

## 3. Toàn bộ Prisma Schema (Hiện tại)

> Database: `stories_db` | Prisma output: `node_modules/@prisma/client-stories`

### 3.1 User & Social Models

| Model | Mô tả | Các trường chính |
|---|---|---|
| `UserProfile` | Social profile (projection từ IAM) | userId, username, displayName, bio, avatarMediaId, coverMediaId, isVerified, isPrivate, followerCount, followingCount, postCount |
| `PrivacySettings` | Cài đặt quyền riêng tư | whoCanSeeMyPosts, whoCanSendFriendRequest, whoCanSeeMyFriendList, whoCanTagMe |
| `AccountSettings` | Cài đặt tài khoản | language, emailNotifications, pushNotifications, twoFactorEnabled |
| `Follow` | A follow B | followerId, followingId, status (PENDING/ACCEPTED) |
| `Friendship` | Kết bạn hai chiều | initiatorId, receiverId, status (PENDING/ACCEPTED/REJECTED), type (NORMAL/CLOSE_FRIEND/FAMILY/RELATIVE/PARTNER) |
| `UserBlock` | Chặn người dùng | blockerId, blockedId |
| `UserMute` | Tắt tiếng người dùng | muterId, mutedId |

### 3.2 Group Models

| Model | Mô tả | Các trường chính |
|---|---|---|
| `Group` | Nhóm | name, description, coverMediaId, privacy (PUBLIC/PRIVATE), memberCount, postCount, createdBy |
| `GroupMember` | Thành viên nhóm | groupId, userId, role (MEMBER/MODERATOR/ADMIN), status (PENDING/ACTIVE) |

### 3.3 Post & Interaction Models

| Model | Mô tả | Các trường chính |
|---|---|---|
| `Post` | Bài đăng social | authorId, type (TEXT/IMAGE/GALLERY/POLL/GIF/LINK/REPOST/QUOTE_REPOST), content, mediaIds[], hashtags[], visibility (PUBLIC/FRIENDS/PRIVATE), groupId, originalPostId, likeCount, commentCount, shareCount, repostCount, viewCount, isDeleted |
| `Poll` | Thăm dò trong post | postId, question, endsAt, totalVotes |
| `PollOption` | Lựa chọn thăm dò | pollId, text, voteCount |
| `PollVote` | Phiếu bầu | optionId, userId |
| `PostHidden` | Ẩn post | postId, userId |
| `Comment` | Bình luận (nested) | postId?, reelId?, authorId, parentId?, content, mentionRanges (JSON), isPinned, likeCount, replyCount, isDeleted |
| `CommentLike` | Like comment | commentId, userId |
| `Reaction` | Emoji reaction | userId, targetId, targetType (POST/COMMENT/REEL/VIDEO/NOVEL/CHAPTER), type (LIKE/SAD/ANGRY/CARE) |
| `Bookmark` | Đánh dấu | userId, targetId, targetType (POST/REEL/VIDEO/NOVEL/CHAPTER) |
| `PostLike` | Like post | postId, userId |

### 3.4 Reel & Video Models

| Model | Mô tả | Các trường chính |
|---|---|---|
| `Reel` | Short-form video | authorId, content, videoMediaId, thumbnailMediaId, duration, hashtags[], visibility (PUBLIC/FRIENDS/PRIVATE), likeCount, commentCount, shareCount, viewCount, totalWatchTime, isDeleted |
| `ReelLike` | Like reel | reelId, userId |
| `Video` | Long-form video | authorId, title, description, videoMediaId, thumbnailMediaId, duration, hashtags[], visibility (PUBLIC/UNLISTED/PRIVATE), likeCount, commentCount, shareCount, viewCount, totalWatchTime, isDeleted |
| `Playlist` | Danh sách phát | authorId, name, description, visibility, itemCount |
| `PlaylistVideo` | Item trong playlist | playlistId, videoId, addedAt, orderIndex |
| `WatchHistory` | Lịch sử xem video | userId, videoId, progressSeconds, isFinished, lastWatchedAt |

### 3.5 Novel Models (★ Core cho reading service)

| Model | Mô tả | Các trường chính |
|---|---|---|
| `Novel` | Tiểu thuyết/truyện | authorId, title, synopsis, coverMediaId, genres[], tags[], status (ONGOING/COMPLETED/HIATUS), visibility (PUBLIC/PRIVATE), averageRating, ratingCount, viewCount, followerCount, chapterCount |
| `Chapter` | Chương truyện | novelId, title, **content (full text)**, orderIndex, viewCount, commentCount |
| `NovelFollow` | Theo dõi truyện | userId, novelId |
| `NovelRating` | Đánh giá truyện | userId, novelId, rating (1-5), review? |
| `ReadingProgress` | Tiến trình đọc | userId, chapterId, novelId (denormalized), progressPercent, lastReadAt |

### 3.6 Other Models

| Model | Mô tả |
|---|---|
| `Notification` | Thông báo in-app (FOLLOW, FRIEND_REQUEST, POST_LIKE, COMMENT_REPLY...) |
| `Hashtag` | Hashtag trending (score velocity-based) |

---

## 4. Novel Module — Chi tiết hiện tại

### 4.1 API Endpoints (Novels Controller)

| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/api/v1/novels` | Danh sách truyện (filter: authorId, genre, tag, status; pagination) |
| `POST` | `/api/v1/novels` | Tạo truyện mới |
| `GET` | `/api/v1/novels/:novelId` | Chi tiết truyện (tăng viewCount) |
| `PUT` | `/api/v1/novels/:novelId` | Cập nhật truyện |
| `DELETE` | `/api/v1/novels/:novelId` | Xóa truyện |
| `GET` | `/api/v1/novels/:novelId/chapters` | Danh sách chương (không trả content) |
| `POST` | `/api/v1/novels/:novelId/chapters` | Thêm chương mới (auto orderIndex) |
| `GET` | `/api/v1/novels/:novelId/chapters/:chapterId` | Đọc nội dung chương (tăng viewCount) |
| `PUT` | `/api/v1/novels/:novelId/chapters/:chapterId` | Cập nhật chương |
| `DELETE` | `/api/v1/novels/:novelId/chapters/:chapterId` | Xóa chương |
| `POST` | `/api/v1/novels/:novelId/follow` | Theo dõi truyện |
| `DELETE` | `/api/v1/novels/:novelId/follow` | Bỏ theo dõi |
| `POST` | `/api/v1/novels/:novelId/rate` | Đánh giá (1-5 sao + review text) |
| `GET` | `/api/v1/novels/me/library` | Tủ sách cá nhân (đọc tiến độ) |
| `PUT` | `/api/v1/novels/:novelId/chapters/:chapterId/progress` | Lưu tiến trình đọc |

### 4.2 Novels Service — Patterns & Logic

```
NovelsService
├── buildPagination()          — Tính toán metadata trang
├── mapAuthor()                — Map UserProfile → tác giả DTO (kèm avatarUrl đã resolve)
├── mapNovel()                 — Map Novel → response DTO (kèm coverUrl, isFollowedByCurrentUser)
├── collectNovelMediaIds()     — Thu thập mediaIds cần resolve (cover + avatar)
├── novelInclude              — Shared Prisma include: { author: true, follows: { userId: true } }
├── listNovels()               — Filter + paginate, resolve media batch
├── createNovel()              — Tạo novel với defaults
├── getNovelById()             — Get + fire-and-forget viewCount++
├── updateNovel()              — Author-guard + partial update
├── deleteNovel()              — Author-guard + hard delete
├── listChapters()             — Chỉ trả metadata (không trả content)
├── createChapter()            — Transaction: create chapter + novel.chapterCount++
├── getChapterById()           — Get full content + fire-and-forget viewCount++
├── updateChapter()            — Author-guard + partial update
├── deleteChapter()            — Transaction: delete + novel.chapterCount--
├── followNovel()              — Idempotent + Transaction: create follow + followerCount++
├── unfollowNovel()            — Idempotent + Transaction: delete follow + followerCount--
├── rateNovel()                — Upsert rating + recalculate averageRating trong transaction
├── updateProgress()           — Upsert ReadingProgress (userId_novelId unique)
└── getMyLibrary()             — ReadingProgress + join novels, trả "tủ sách"
```

### 4.3 DTOs

| DTO | Fields |
|---|---|
| `CreateNovelDto` | title (1-255), synopsis? (max 5000), coverMediaId?, genres[]?, tags[]?, status? (ONGOING/COMPLETED/HIATUS), visibility? (PUBLIC/PRIVATE) |
| `UpdateNovelDto` | Tất cả optional như Create |
| `CreateChapterDto` | title (1-255), content (min 1) |
| `UpdateChapterDto` | title?, content? |
| `RateNovelDto` | rating (1-5 int), review? (max 1000) |
| `UpdateReadingProgressDto` | progressPercent (0-100 float) |
| `NovelsQueryDto` | page, pageSize, authorId?, genre?, tag?, status? |
| `PaginationQueryDto` | page (default 1), pageSize (default 20, max 50) |

---

## 5. Infrastructure & Patterns

### 5.1 Auth Flow
```
Client → API Gateway → (verify JWT) → inject X-User-ID header → stories-service
                                                                       ↓
                                                           @CurrentUser() decorator
                                                           reads request.headers['x-user-id']
```

### 5.2 Media Resolution Flow
```
stories-service (có coverMediaId, avatarMediaId)
     ↓ HTTP GET MEDIA_SERVICE_URL/media/{id}/access
media-service (trả presigned URL: original, thumbnail, hls)
     ↓
stories-service trả về response với coverUrl, avatarUrl đã resolved
```

### 5.3 Event-Driven (User Sync)
```
iam-service publishes → Redis Pub/Sub channel: "user.created.v1"
                              ↓
stories-service UserEventListenersService.onModuleInit()
  subscribes + handles → creates UserProfile in stories DB
```

### 5.4 Fire-and-forget View Count
```typescript
// View tăng async, không block response
this.prisma.novel.update({ data: { viewCount: { increment: 1 } } })
  .catch(err => logger.error(...));
```

### 5.5 Transaction Pattern
```typescript
// Dùng prisma.$transaction() cho các thao tác atomic
// Ví dụ: createChapter + novel.chapterCount++
// Ví dụ: followNovel + novel.followerCount++
```

### 5.6 Pagination Response Shape
```json
{
  "statusCode": 200,
  "data": [...],
  "meta": {
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20,
      "hasNext": true
    },
    "timestamp": "2026-09-19T..."
  }
}
```

---

## 6. Environment Variables

```env
NODE_ENV=production
STORIES_SERVICE_PORT=3005
STORIES_DATABASE_URL=postgresql://stories_admin:stories_password@localhost:5436/stories_db?schema=public
REDIS_URL=redis://:redis_password@redis:6379
MEDIA_SERVICE_URL=http://localhost:3003/api/v1
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318
```

---

## 7. Database Indexes Hiện Tại (Novel-related)

```prisma
// Novel
@@index([visibility, createdAt(sort: Desc)])    — Browse public novels
@@index([authorId, createdAt(sort: Desc)])       — Author's novels
@@index([status, createdAt(sort: Desc)])         — Filter by status
@@index([averageRating(sort: Desc)])             — Top-rated

// Chapter
@@unique([novelId, orderIndex])
@@index([novelId, orderIndex(sort: Asc)])        — Chapter list ordered

// NovelFollow
@@index([userId, createdAt(sort: Desc)])         — User's followed novels

// NovelRating
@@index([novelId, createdAt(sort: Desc)])        — Novel's ratings

// ReadingProgress
@@index([userId, lastReadAt(sort: Desc)])        — User's reading history
@@unique([userId, novelId])                      — One progress per user per novel
```

---

## 8. Gap Analysis — Thiếu để thành Web App Truyện Đầy Đủ

Dựa trên phân tích service hiện tại so với các platform đọc truyện lớn (Wattpad, TruyenFull, Tangthuvien, Sstruyen, Metruyencv...), các tính năng **còn thiếu hoàn toàn**:

### 8.1 Database Models cần thêm/mở rộng

| Model cần thêm | Mô tả | Lý do |
|---|---|---|
| `Genre` / `Tag` table | Danh mục thể loại/nhãn chuẩn hóa | Hiện genres/tags là `String[]`, không có danh mục chuẩn |
| `ChapterComment` | Comment chuyên biệt cho chương | Hiện `Comment` dùng chung, chapter comment chưa link |
| `NovelAward` | Giải thưởng/huy hiệu | Hot, Featured, Editor's Pick... |
| `ReadingList` | Shelf cá nhân (tủ sách phân loại) | "Đang đọc", "Đã đọc", "Muốn đọc", custom shelf |
| `NovelReport` | Báo cáo vi phạm | Report truyện/chương |
| `ChapterReport` | Báo cáo chương | — |
| `Announcement` | Thông báo của tác giả | Tác giả gửi thông báo đến readers |
| `NovelTranslation` | Dịch sang ngôn ngữ khác | Multi-language |
| `PremiumChapter` | Chương VIP/trả phí | Paywall per chapter |
| `Coin` / `Transaction` | Hệ thống xu/thanh toán | Mua chương VIP |
| `Donation` | Tặng quà cho tác giả | — |
| `SearchHistory` | Lịch sử tìm kiếm người dùng | — |
| `NovelRecommendation` | Gợi ý truyện | AI/rule-based |
| `AuthorProfile` | Hồ sơ tác giả nâng cao | Bio dài, xã hội, website tác giả |

### 8.2 API Endpoints cần thêm

| Endpoint | Mô tả |
|---|---|
| `GET /novels/trending` | Truyện trending (hot theo thời gian thực) |
| `GET /novels/featured` | Truyện nổi bật (editor's pick) |
| `GET /novels/completed` | Truyện hoàn thành |
| `GET /novels/:id/ratings` | Danh sách đánh giá (có phân trang) |
| `GET /novels/:id/recommendations` | Truyện tương tự |
| `GET /novels/:id/chapters/:cid/comments` | Comment chương |
| `POST /novels/:id/chapters/:cid/comments` | Đăng comment chương |
| `GET /authors/:authorId/novels` | Danh sách truyện của tác giả |
| `GET /genres` | Danh sách thể loại + số lượng |
| `GET /genres/:slug/novels` | Truyện theo thể loại |
| `GET /me/reading-lists` | Tủ sách phân loại cá nhân |
| `POST /me/reading-lists` | Tạo shelf tùy chỉnh |
| `POST /me/reading-lists/:id/novels` | Thêm truyện vào shelf |
| `GET /search/novels` | Tìm kiếm truyện (full-text, filter phức tạp) |
| `GET /me/history` | Lịch sử đọc truyện |
| `POST /novels/:id/report` | Báo cáo truyện |
| `GET /novels/:id/announcements` | Thông báo từ tác giả |
| `GET /me/notifications` | Thông báo (chapter mới, comment...) |
| `GET /statistics/novels/:id` | Analytics cho tác giả |

### 8.3 Features cần cải thiện ở logic hiện tại

| Feature | Vấn đề hiện tại | Cải thiện đề xuất |
|---|---|---|
| **View count** | Fire-and-forget direct DB write — không chống spam | Dùng Redis counter + batch flush |
| **Rating recalc** | `tx.novelRating.aggregate()` mỗi lần rate — không scale | Dùng running average hoặc background job |
| **Content lưu trữ** | Chapter content lưu trong PostgreSQL (`String`) — không scale với truyện dài | Xem xét lưu vào object storage (MinIO) hoặc bảng riêng |
| **Search** | Chưa có full-text search cho novels | Tích hợp PostgreSQL `tsvector` hoặc Elasticsearch |
| **Caching** | Không có cache cho novel detail, chapter list | Redis cache với TTL |
| **Trending algorithm** | Chưa có | Cần scoring system (viewCount, followCount, ratingCount velocity) |
| **Chapter ordering** | `orderIndex = novel.chapterCount + 1` — race condition khi insert đồng thời | Dùng `MAX(orderIndex) + 1` trong transaction |
| **Soft delete** | Novel/Chapter dùng hard delete | Nên dùng soft delete với `isDeleted` + `deletedAt` |
| **Visibility** | Chỉ PUBLIC/PRIVATE | Thêm DRAFT (tác giả draft chương chưa publish) |

---

## 9. Service Architecture Overview

```
                    ┌─────────────────────────────────────────────────┐
                    │              stories-service (port 3005)         │
                    │                                                  │
                    │  ┌──────────────────────────────────────────┐   │
                    │  │           16 Business Modules            │   │
                    │  │  users, follow, friendship, posts,        │   │
                    │  │  comments, reactions, bookmarks,          │   │
                    │  │  notifications, reels, videos,            │   │
                    │  │  ★ novels, analytics, hashtags,           │   │
                    │  │  search, groups, profile (legacy)         │   │
                    │  └──────────────────────────────────────────┘   │
                    │                                                  │
                    │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
                    │  │ Prisma   │  │  Redis   │  │ EventBus     │  │
                    │  │ Service  │  │  Cache   │  │ (Pub/Sub)    │  │
                    │  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
                    └───────┼─────────────┼────────────────┼──────────┘
                            │             │                │
                    ┌───────▼──┐  ┌───────▼──┐  ┌─────────▼────────┐
                    │ stories  │  │  Redis   │  │  Redis Pub/Sub   │
                    │   DB     │  │          │  │  (user.created)  │
                    │(postgres)│  └──────────┘  └──────────────────┘
                    └──────────┘
                            
                    ┌──────────────────────────────────────────────┐
                    │          External Service Calls              │
                    │  media-service: GET /media/{id}/access       │
                    │  (resolve presigned URLs for covers/avatars) │
                    └──────────────────────────────────────────────┘
```

---

## 10. Kết luận & Khuyến nghị cho Reading Service

### Option A: Mở rộng `stories-service` hiện tại
- **Pros**: Không cần clone/setup mới, dùng chung DB
- **Cons**: Service đã có 16 modules (social features), sẽ càng phình to; social schema lẫn reading schema

### Option B: Tách `reading-service` mới (Khuyến nghị)
- **Pros**: 
  - Separation of concerns rõ ràng
  - Database riêng (chỉ chứa novel-domain data, không có social posts/reels/groups)
  - Scale độc lập (reading traffic khác hẳn social feed traffic)
  - Team có thể làm song song
- **Cons**: Cần duplicate `UserProfile` projection, setup thêm service

### Baseline Code Pattern để kế thừa
Khi build `reading-service` mới, kế thừa các patterns sau từ `stories-service`:
1. **Fastify adapter** — performance tốt hơn Express cho I/O heavy
2. **`@CurrentUser()` decorator** — pattern auth qua `X-User-ID` header
3. **`MediaResolverService`** — pattern resolve media URLs không truy cập trực tiếp
4. **`EventBusService`** — subscribe `user.created.v1` để sync UserProfile
5. **Fire-and-forget view count** — nhưng cải thiện với Redis counter
6. **Prisma transaction pattern** — cho atomic operations
7. **`buildPagination()`** response shape — giữ consistent API contract
8. **Zod config schema** — `loadConfig(BaseEnvSchema.extend(...))`
