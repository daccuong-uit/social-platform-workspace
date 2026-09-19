# BẢN KHẢO SÁT VÀ SNAPSHOT KIẾN TRÚC: `stories-web-client`

> **Tài liệu chuyển giao cho AI** để lập kế hoạch xây dựng Web Client Đọc Truyện Chữ (Novel Reading Platform)
> **Phiên bản thiết kế:** Modern Minimalist Story Theme
> **Tham chiếu backend:** `reading-service-design.md` & `schema.prisma` (cùng thư mục)
> **Workspace:** `d:\social-platform-workspace`

---

## 1. TỔNG QUAN HIỆN TRẠNG (EXECUTIVE SUMMARY)

### 1.1 Mục tiêu dự án

Chuyển đổi client `stories-web-client` hiện tại (vốn được scaffold/clone từ `social-web-client`) thành **Web App đọc truyện chữ chuyên nghiệp** đồng bộ với hệ thống backend `reading-service` (55 model Prisma, 20 business module). Client mới tuân thủ ngôn ngữ thiết kế **Modern Minimalist Story Theme** (tối giản, trang nhã, ưu tiên tối đa cho độ tập trung và trải nghiệm đọc văn bản).

> **QUAN TRỌNG:** Không giữ `PageShellComponent` hiện tại (layout 3 cột social). Chỉ giữ **cấu trúc tổ chức thư mục** (`libs/core`, `libs/ui`, `libs/entities`, `libs/features`) và toàn bộ hạ tầng tầng core (auth, api, interceptors, design-system). Mọi component UI/layout sẽ được thiết kế lại từ đầu phù hợp với domain đọc truyện.

### 1.2 Tech Stack & Nền tảng

| Thành phần | Phiên bản / Công nghệ |
|---|---|
| Framework | Angular v21.2.0 (Standalone Components, Signals) |
| Monorepo | Nx v22.7.2 |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss` 4.3.0) + CSS Custom Properties |
| State | Angular Signals + Facade Pattern (1 Facade per entity domain) |
| Toast | `ngx-sonner` v3.1.0 |
| Media | `hls.js` v1.7.1 (dự phòng cho audiobook) |
| Deploy | Nginx Alpine + Docker multi-stage build |
| Dev port | `4203` (`storiesUrl: http://localhost:4203`) |

---

## 2. SNAPSHOT CẤU TRÚC FILE HIỆN TẠI

### 2.1 Cây thư mục đầy đủ

```
frontend/stories-web-client/
├── package.json                         # Angular 21, Nx 22, Tailwind v4
├── nx.json
├── tsconfig.base.json                   # Path aliases (@fe/*)
├── nginx.conf                           # Nginx SPA config, proxy /api/ → gateway:3000
├── Dockerfile
├── apps/
│   └── web/
│       ├── project.json
│       ├── tsconfig.app.json
│       └── src/
│           ├── main.ts
│           ├── index.html
│           ├── styles.css               # Design tokens, theme vars, spacing/typography scale
│           ├── environments/
│           │   └── environment.ts
│           └── app/
│               ├── app.component.ts     # <router-outlet> + <ngx-sonner-toaster>
│               ├── app.config.ts
│               └── routes/
│                   ├── app.routes.ts
│                   └── index.ts
└── libs/
    ├── core/                            # Hạ tầng dùng chung — GIỮ TOÀN BỘ
    │   └── src/
    │       ├── index.ts
    │       └── lib/
    │           ├── config/
    │           │   ├── app-config.ts    # apiUrl runtime config
    │           │   ├── url-config.ts    # Endpoint paths (BỔ SUNG reading endpoints)
    │           │   └── index.ts
    │           ├── design-system/
    │           │   ├── design-tokens.ts           # Hệ thống token CSS
    │           │   └── ui-settings.service.ts     # font-size-scale, spacing-scale-base
    │           ├── guards/
    │           │   ├── auth.guard.ts
    │           │   └── guest.guard.ts
    │           ├── interceptors/
    │           │   ├── auth.interceptor.ts
    │           │   ├── error.interceptor.ts
    │           │   └── loading.interceptor.ts
    │           ├── models/
    │           │   └── error.model.ts
    │           ├── pipes/
    │           │   └── relative-time.pipe.ts
    │           └── services/
    │               ├── api.service.ts             # Core HTTP (ApiResponse<T>)
    │               ├── auth.service.ts            # Auth state (Signals)
    │               ├── cache.service.ts
    │               ├── error.service.ts
    │               ├── loading.service.ts
    │               ├── route-reuse.strategy.ts
    │               ├── tab-keep-alive.service.ts
    │               └── theme.service.ts           # Theme: light|sepia|dark|oled
    │
    ├── ui/                              # Presentational components — VIẾT LẠI CHO DOMAIN TRUYỆN
    │   └── src/
    │       ├── index.ts
    │       └── lib/
    │           ├── button/
    │           │   ├── button.ts
    │           │   └── action-button.ts
    │           ├── card/
    │           │   └── card.ts
    │           ├── input/
    │           │   └── input.ts
    │           ├── logo/
    │           │   └── logo.component.ts          # Brand logo đọc truyện
    │           ├── loader/
    │           │   ├── index.ts
    │           │   └── inline-loader.component.ts
    │           ├── skeleton/
    │           │   ├── index.ts
    │           │   ├── skeleton.component.ts
    │           │   ├── skeleton-card.component.ts
    │           │   └── skeleton-list.component.ts
    │           ├── directives/
    │           │   ├── index.ts
    │           │   └── loading.directive.ts
    │           ├── components/
    │           │   ├── index.ts
    │           │   ├── sidebar-menu/              # Navigation menu (THIẾT KẾ LẠI)
    │           │   │   ├── sidebar-menu.component.ts
    │           │   │   ├── sidebar-menu.component.html
    │           │   │   ├── sidebar-menu.component.css
    │           │   │   ├── global-menu.ts         # Menu items cho domain truyện
    │           │   │   └── safe-html.pipe.ts
    │           │   ├── shared-header/             # Header (THIẾT KẾ LẠI — search, coin, user)
    │           │   │   ├── shared-header.component.ts
    │           │   │   ├── shared-header.component.html
    │           │   │   └── shared-header.component.css
    │           │   ├── shared-table/              # Bảng dữ liệu dùng chung
    │           │   │   ├── shared-table.component.ts
    │           │   │   ├── shared-table.component.html
    │           │   │   └── shared-table.component.css
    │           │   ├── tabs/
    │           │   │   ├── ui-tabs.component.ts
    │           │   │   ├── ui-tabs.component.html
    │           │   │   └── ui-tabs.component.css
    │           │   └── current-user-card/
    │           │       ├── current-user-card.component.ts
    │           │       ├── current-user-card.component.html
    │           │       └── current-user-card.component.css
    │           ├── layouts/
    │           │   └── form-layout.component.ts
    │           ├── footer/
    │           │   ├── app-footer.component.ts
    │           │   └── auth-footer.component.ts
    │           └── styles/
    │               └── component-styles.ts
    │
    ├── entities/                        # Data-access & Domain Models — TỔ CHỨC LẠI
    │   ├── novel/                       # Novel, NovelStats, Genre, Tag, Contributor
    │   │   └── src/
    │   │       ├── index.ts
    │   │       └── lib/
    │   │           ├── models/
    │   │           └── services/
    │   ├── chapter/                     # Volume, Chapter, ChapterContent, Revision
    │   │   └── src/
    │   │       ├── index.ts
    │   │       └── lib/
    │   │           ├── models/
    │   │           └── services/
    │   ├── reading/                     # ReadingProgress, ReadingHistory, Bookmark
    │   │   └── src/
    │   │       ├── index.ts
    │   │       └── lib/
    │   │           ├── models/
    │   │           └── services/
    │   ├── library/                     # Shelf, ShelfItem
    │   │   └── src/
    │   │       ├── index.ts
    │   │       └── lib/
    │   │           ├── models/
    │   │           └── services/
    │   ├── review-comment/              # Review, Comment, ParagraphComment
    │   │   └── src/
    │   │       ├── index.ts
    │   │       └── lib/
    │   │           ├── models/
    │   │           └── services/
    │   ├── author/                      # AuthorProfile, AuthorFollow
    │   │   └── src/
    │   │       ├── index.ts
    │   │       └── lib/
    │   │           ├── models/
    │   │           └── services/
    │   ├── wallet/                      # Wallet, Transaction, TopUpPackage, Unlock
    │   │   └── src/
    │   │       ├── index.ts
    │   │       └── lib/
    │   │           ├── models/
    │   │           └── services/
    │   ├── discovery/                   # HomeSections, Rankings, Collections, Search
    │   │   └── src/
    │   │       ├── index.ts
    │   │       └── lib/
    │   │           ├── models/
    │   │           └── services/
    │   └── media/                       # Upload bìa & ảnh truyện (GIỮ NGUYÊN media.service.ts)
    │       └── src/
    │           ├── index.ts
    │           └── lib/
    │               └── services/
    │                   └── media.service.ts
    │
    └── features/                        # Smart Containers / Feature Pages — XÂY MỚI
        ├── discovery/                   # Trang chủ, BXH, Thịnh hành, Tuyển tập
        │   └── src/
        │       ├── index.ts
        │       └── lib/
        │           ├── lib.routes.ts
        │           └── discovery/
        ├── novel-detail/                # Chi tiết truyện, mục lục, review, bình luận
        │   └── src/
        │       ├── index.ts
        │       └── lib/
        │           ├── lib.routes.ts
        │           └── novel-detail/
        ├── reader/                      # Trình đọc Zen mode
        │   └── src/
        │       ├── index.ts
        │       └── lib/
        │           ├── lib.routes.ts
        │           └── reader/
        ├── search/                      # Tìm kiếm full-text, lọc theo thể loại
        │   └── src/
        │       ├── index.ts
        │       └── lib/
        │           ├── lib.routes.ts
        │           └── search/
        ├── library/                     # Tủ sách cá nhân, lịch sử, bookmark
        │   └── src/
        │       ├── index.ts
        │       └── lib/
        │           ├── lib.routes.ts
        │           └── library/
        ├── wallet/                      # Nạp xu, mở khoá chương, giao dịch
        │   └── src/
        │       ├── index.ts
        │       └── lib/
        │           ├── lib.routes.ts
        │           └── wallet/
        ├── author-studio/               # Quản lý truyện, viết chương, thống kê, doanh thu
        │   └── src/
        │       ├── index.ts
        │       └── lib/
        │           ├── lib.routes.ts
        │           └── author-studio/
        ├── profile/                     # Trang cá nhân (GIỮ CẤU TRÚC, viết lại nội dung)
        │   └── src/
        │       ├── index.ts
        │       └── lib/
        │           ├── lib.routes.ts
        │           └── profile/
        └── settings/                    # Cài đặt giao diện đọc (font, size, theme)
            └── src/
                ├── index.ts
                └── lib/
                    ├── lib.routes.ts
                    └── settings/
```

---

## 3. PATH MAPPINGS (`tsconfig.base.json` HIỆN TẠI & MỤC TIÊU)

### 3.1 Hiện tại
```json
{
  "paths": {
    "@fe/ui":               ["./libs/ui/src/index.ts"],
    "@fe/core":             ["./libs/core/src/index.ts"],
    "@fe/features/home":    ["./libs/features/home/src/index.ts"],
    "@fe/features/profile": ["./libs/features/profile/src/index.ts"],
    "@fe/features/media":   ["./libs/features/media/src/index.ts"],
    "@fe/entities/profile": ["./libs/entities/profile/src/index.ts"],
    "@fe/entities/media":   ["./libs/entities/media/src/index.ts"],
    "@fe/entities/social":  ["./libs/entities/social/src/index.ts"],
    "@fe/features/settings":"./libs/features/settings/src/index.ts"],
    "@fe/features/stories": ["./libs/features/stories/src/index.ts"]
  }
}
```

### 3.2 Mục tiêu (cần cập nhật)
```json
{
  "paths": {
    "@fe/ui":                     ["./libs/ui/src/index.ts"],
    "@fe/core":                   ["./libs/core/src/index.ts"],
    "@fe/entities/novel":         ["./libs/entities/novel/src/index.ts"],
    "@fe/entities/chapter":       ["./libs/entities/chapter/src/index.ts"],
    "@fe/entities/reading":       ["./libs/entities/reading/src/index.ts"],
    "@fe/entities/library":       ["./libs/entities/library/src/index.ts"],
    "@fe/entities/review-comment":["./libs/entities/review-comment/src/index.ts"],
    "@fe/entities/author":        ["./libs/entities/author/src/index.ts"],
    "@fe/entities/wallet":        ["./libs/entities/wallet/src/index.ts"],
    "@fe/entities/discovery":     ["./libs/entities/discovery/src/index.ts"],
    "@fe/entities/media":         ["./libs/entities/media/src/index.ts"],
    "@fe/features/discovery":     ["./libs/features/discovery/src/index.ts"],
    "@fe/features/novel-detail":  ["./libs/features/novel-detail/src/index.ts"],
    "@fe/features/reader":        ["./libs/features/reader/src/index.ts"],
    "@fe/features/search":        ["./libs/features/search/src/index.ts"],
    "@fe/features/library":       ["./libs/features/library/src/index.ts"],
    "@fe/features/wallet":        ["./libs/features/wallet/src/index.ts"],
    "@fe/features/author-studio": ["./libs/features/author-studio/src/index.ts"],
    "@fe/features/profile":       ["./libs/features/profile/src/index.ts"],
    "@fe/features/settings":      ["./libs/features/settings/src/index.ts"]
  }
}
```

---

## 4. HẠ TẦNG CORE CẦN GIỮ NGUYÊN (KHÔNG THAY ĐỔI)

### 4.1 `api.service.ts` — Pattern gọi HTTP
```typescript
// ApiService tự nối apiUrl + parse ApiResponse<T>
// Các entity service sẽ inject ApiService, KHÔNG inject HttpClient trực tiếp
interface ApiResponse<T> {
  data: T;
  message?: string;
  pagination?: PaginationMeta;
}
```

### 4.2 `auth.service.ts` — Auth State (Signals)
```typescript
// Các signal:
user = this._user.asReadonly();          // Signal<User | null>
isAuthenticated = computed(() => !!this._user());  // Signal<boolean>

// Tự động: storeTokens(accessToken, refreshToken), fetchProfile('/profiles/me')
```

### 4.3 `ui-settings.service.ts` — Dynamic Scaling
```typescript
// Điều khiển --font-size-scale (0.8 → 1.4) và --spacing-scale-base (3.5px → 6.6px)
// Các component không hardcode px, dùng calc() với biến CSS
// Setting lưu vào localStorage key 'ui-settings'
```

### 4.4 Interceptor Pipeline (Không chỉnh sửa)
1. `auth.interceptor.ts` → Inject `Authorization: Bearer <token>` mọi request
2. `loading.interceptor.ts` → Toggle loading state (opt-in qua `showGlobalLoading` HttpContext)
3. `error.interceptor.ts` → Handle 401 (auto refresh token), toast error messages

### 4.5 `route-reuse.strategy.ts`
- Cache route component state khi điều hướng giữa các tab.
- Cực kỳ quan trọng để giữ scroll position và trạng thái đọc khi quay lại trang truyện.

---

## 5. NỢ KỸ THUẬT CẦN DỌN DẸP

### 5.1 `GLOBAL_MENU_ITEMS` (social → story domain)
**Hiện tại (sai):**
```typescript
// /social, /reels, /friends, /chat, /reals-ai, /bookmarks, /profile
```
**Cần đổi thành:**
```typescript
[
  { id: 'discovery', label: 'Khám phá', link: '/discovery' },    // Trang chủ truyện
  { id: 'library',   label: 'Tủ sách',  link: '/library' },      // Tủ sách cá nhân
  { id: 'rankings',  label: 'Bảng xếp hạng', link: '/discovery/rankings' },
  { id: 'genres',    label: 'Thể loại', link: '/discovery/genres' },
  { id: 'search',    label: 'Tìm kiếm', link: '/search' },
  { id: 'author-studio', label: 'Sáng tác', link: '/author-studio', badge: 'Tác giả' },
  { id: 'wallet',    label: 'Ví xu',    link: '/wallet' },
  { id: 'profile',   label: 'Hồ sơ',   link: '/profile' },
]
```

### 5.2 `url-config.ts` (Cần bổ sung reading-service endpoints)
```typescript
export const urlConfig = {
  auth: { /* GIỮ NGUYÊN */ },
  profile: { me: '/profiles/me' },            // GIỮ NGUYÊN
  media: { /* GIỮ NGUYÊN */ },
  // === BỔ SUNG ===
  novels: {
    list: '/novels',
    detail: (id: string) => `/novels/${id}`,
    latest: '/novels/latest',
    trending: '/novels/trending',
    completed: '/novels/completed',
    reviews: (id: string) => `/novels/${id}/reviews`,
    follow: (id: string) => `/novels/${id}/follow`,
    chapters: (id: string) => `/novels/${id}/chapters`,
    chapterByOrder: (slug: string, order: number) => `/novels/${slug}/chapters/by-order/${order}`,
    rate: (id: string) => `/novels/${id}/rate`,
    votes: (id: string) => `/novels/${id}/votes`,
  },
  genres: {
    list: '/genres',
    novels: (slug: string) => `/genres/${slug}/novels`,
  },
  reading: {
    progress: (novelId: string, chapterId: string) => `/novels/${novelId}/chapters/${chapterId}/progress`,
    continueReading: '/me/reading/continue',
    history: '/me/history',
  },
  library: {
    list: '/me/library',
    shelves: '/me/shelves',
    shelf: (id: string) => `/me/shelves/${id}`,
    addNovel: (shelfId: string) => `/me/shelves/${shelfId}/novels`,
    updateStatus: (novelId: string) => `/me/novels/${novelId}/shelf`,
  },
  wallet: {
    balance: '/me/wallet',
    transactions: '/me/wallet/transactions',
    packages: '/wallet/packages',
    topup: '/wallet/topups',
    unlock: (novelId: string, chapterId: string) => `/novels/${novelId}/chapters/${chapterId}/unlock`,
  },
  discovery: {
    home: '/discovery/home',
    rankings: '/rankings',
    collections: '/collections',
    recommendations: '/me/recommendations',
  },
  search: {
    novels: '/search/novels',
    suggest: '/search/suggest',
    trending: '/search/trending-keywords',
  },
  notifications: {
    list: '/me/notifications',
    unreadCount: '/me/notifications/unread-count',
    readAll: '/me/notifications/read-all',
  },
  authorStudio: {
    novels: '/me/author/novels',
    statistics: (novelId: string) => `/statistics/novels/${novelId}`,
    overview: '/me/author/statistics/overview',
    earnings: '/me/earnings',
    payouts: '/me/payouts',
  },
};
```

### 5.3 Thư mục cần xoá / không dùng
- `libs/entities/social/` — models social post, reel, comment social
- `libs/features/stories/` — placeholder rỗng (thay bằng `discovery`, `novel-detail`, `reader`)
- `libs/features/media/` — chức năng media-studio không phù hợp (có thể giữ media-upload service)
- `libs/ui/src/lib/components/social/` — post-card, create-post-modal, feed-reels-strip, v.v.
- `libs/ui/src/lib/components/profile/` — profile-friend-card, profile-group-card (social specific)

---

## 6. ROUTING MỤC TIÊU (`app.routes.ts`)

```typescript
import { Route } from '@angular/router';
import { authGuard } from '@fe/core';

export const appRoutes: Route[] = [
  // Redirect mặc định
  { path: '', pathMatch: 'full', redirectTo: 'discovery' },

  // === CÔNG KHAI — không cần đăng nhập ===
  {
    path: 'discovery',
    loadChildren: () => import('@fe/features/discovery').then((m) => m.discoveryRoutes),
  },
  {
    path: 'novels/:idOrSlug',
    loadChildren: () => import('@fe/features/novel-detail').then((m) => m.novelDetailRoutes),
  },
  {
    // Zen Reader Mode — URL thân thiện SEO
    path: 'read/:novelSlug/:chapterOrder',
    loadChildren: () => import('@fe/features/reader').then((m) => m.readerRoutes),
  },
  {
    path: 'search',
    loadChildren: () => import('@fe/features/search').then((m) => m.searchRoutes),
  },

  // === YÊU CẦU ĐĂNG NHẬP ===
  {
    path: 'library',
    canActivate: [authGuard],
    loadChildren: () => import('@fe/features/library').then((m) => m.libraryRoutes),
  },
  {
    path: 'wallet',
    canActivate: [authGuard],
    loadChildren: () => import('@fe/features/wallet').then((m) => m.walletRoutes),
  },
  {
    path: 'author-studio',
    canActivate: [authGuard],
    loadChildren: () => import('@fe/features/author-studio').then((m) => m.authorStudioRoutes),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () => import('@fe/features/profile').then((m) => m.profileRoutes),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadChildren: () => import('@fe/features/settings').then((m) => m.settingsRoutes),
  },

  { path: '**', redirectTo: 'discovery' },
];
```

---

## 7. DESIGN SYSTEM: MODERN MINIMALIST STORY THEME

### 7.1 Triết lý thẩm mỹ
- **Tối giản & Tập trung (Distraction-Free):** Không viền gắt, không bóng đổ nặng, không banner màu mè. Nhường toàn bộ không gian cho văn bản.
- **Văn hoá Đọc tao nhã (Editorial):** Kết hợp Sans-serif cho UI và Serif cổ điển cho vùng đọc chương.
- **Khoảng thở & Nhịp điệu (Rhythm):** Tỷ lệ vàng trong leading, paragraph spacing, column width.
- **Tương phản êm dịu:** Không `#000` trên `#FFF`. Dùng tone mực dịu mắt chống mỏi.

### 7.2 Bốn Palette Màu Chủ Đạo

```css
/* 1. Light Warm (Giấy trắng ấm — mặc định ban ngày) */
:root, .theme-light {
  --color-surface-base:    #faf9f6;    /* Alabaster Paper */
  --color-surface-subtle:  #f2efe9;    /* Warm Linen */
  --color-surface-card:    #ffffff;
  --color-border-subtle:   rgba(26, 26, 26, 0.07);
  --color-border-default:  rgba(26, 26, 26, 0.12);
  --color-text-base:       #232220;    /* Soft Ink */
  --color-text-muted:      #736f69;
  --color-brand-primary:   #a35d38;    /* Terracotta / Amber */
  --color-brand-secondary: #e8d5b5;    /* Wheat */
  --color-accent:          #2e5a44;    /* Sage Forest */
}

/* 2. Sepia Parchment (Giấy dó vintage — đọc ban ngày) */
.theme-sepia {
  --color-surface-base:   #f4ecd8;    /* Vintage Parchment */
  --color-surface-subtle: #eae0c8;
  --color-surface-card:   #faf4e5;
  --color-border-subtle:  rgba(92, 70, 43, 0.1);
  --color-border-default: rgba(92, 70, 43, 0.18);
  --color-text-base:      #3c3226;    /* Dark Sepia Ink */
  --color-text-muted:     #7d6e5d;
  --color-brand-primary:  #8a4823;
}

/* 3. Dark Charcoal (Than chì dịu mắt — đọc ban đêm) */
.dark, .theme-dark {
  --color-surface-base:    #141416;    /* Deep Charcoal */
  --color-surface-subtle:  #1c1c1f;
  --color-surface-card:    #232328;
  --color-border-subtle:   rgba(255, 255, 255, 0.08);
  --color-border-default:  rgba(255, 255, 255, 0.14);
  --color-text-base:       #e6e6e8;    /* Soft Silver */
  --color-text-muted:      #95959e;
  --color-brand-primary:   #e08b58;    /* Warm Amber Glow */
  --color-brand-primary-hover: #f19f6f;
}

/* 4. OLED Midnight (Đen thuần — màn hình OLED) */
.theme-oled {
  --color-surface-base:   #000000;
  --color-surface-subtle: #0f0f10;
  --color-surface-card:   #151517;
  --color-border-subtle:  #222225;
  --color-text-base:      #d8d8dc;
  --color-text-muted:     #7c7c85;
  --color-brand-primary:  #d47a46;
}
```

### 7.3 Reader Engine — Typography Riêng Biệt

Bộ biến CSS chuyên dụng cho **Trình đọc chương** (độc lập với UI scaling chung):

```css
/* Khu vực đọc chương — reader-shell component */
.reader-content {
  /* Font: Người dùng chọn giữa Serif và Sans */
  --reader-font-family:    'Playfair Display', Georgia, serif; /* hoặc 'Inter', 'Outfit' */
  --reader-font-size:      18px;     /* 15px → 28px, slider */
  --reader-line-height:    1.8;      /* 1.5 | 1.75 | 2.0 */
  --reader-max-width:      680px;    /* 680 | 800 | 1000 | fullscreen */
  --reader-paragraph-spacing: 1.4rem;
  --reader-letter-spacing: 0.01em;
}
```

**Fonts cần import (đã có trong `index.html`):**
- UI: `Outfit`, `Inter`, `Syne`
- Reader Serif: `Playfair Display`, `Lora`, `Merriweather`

---

## 8. MAPPING BACKEND → FRONTEND

Ánh xạ 20 module backend sang frontend theo `reading-service-design.md`:

| # | Backend Module | Entity Lib | Feature Lib | UI Components chính |
|---|---|---|---|---|
| 1 | `users`, `authors` | `entities/author` | `features/profile`, `features/author-studio` | author-card, author-stats |
| 2 | `follow` | (trong `entities/novel`, `entities/author`) | (tích hợp vào chi tiết) | follow-btn, follow-author-btn |
| 3 | `genres` | `entities/discovery` | `features/discovery` | genre-badge, tag-chip, genre-filter |
| 4 | `novels` | `entities/novel` | `features/novel-detail`, `features/discovery` | novel-card, novel-cover, novel-grid |
| 5 | `chapters` | `entities/chapter` | `features/reader`, `features/author-studio` | toc-drawer, chapter-row, chapter-nav-bar |
| 6 | `reading` | `entities/reading` | `features/reader`, `features/library` | progress-bar, bookmark-popover |
| 7 | `library` | `entities/library` | `features/library` | shelf-tabs, shelf-novel-card, add-to-shelf-dialog |
| 8 | `reviews` | `entities/review-comment` | (trong `features/novel-detail`) | review-card, rating-stars, rating-breakdown |
| 9 | `comments` | `entities/review-comment` | (trong `features/novel-detail`, `features/reader`) | comment-thread, paragraph-comment-bubble |
| 10 | `reactions`, `votes` | `entities/review-comment` | (trong `features/reader`) | chapter-reactions-bar, vote-ticket-modal |
| 11 | `discovery`, `search` | `entities/discovery` | `features/discovery`, `features/search` | hero-slider, ranking-list, search-box |
| 12 | `wallet`, `earnings` | `entities/wallet` | `features/wallet`, `features/author-studio` | coin-badge, topup-package-card, unlock-dialog |
| 13 | `notifications` | (service layer) | (header + feature notifications) | notification-dot, notification-panel |
| 14 | `announcements` | (service layer) | (trong `features/novel-detail`) | announcement-banner |
| 15 | `moderation` | (admin only) | (không build ở client này) | report-btn |

---

## 9. HƯỚNG DẪN PHÂN CHIA PHASES XÂY DỰNG

### Phase 1 — Dọn dẹp & Nền tảng (Foundation)
- Xoá: `libs/entities/social`, `libs/features/stories` (placeholder), `libs/ui/components/social`, `libs/ui/components/profile` (social cards)
- Giữ cấu trúc thư mục `libs/core`, `libs/ui`, `libs/entities`, `libs/features`
- Cập nhật: `tsconfig.base.json` (paths mới), `global-menu.ts` (menu truyện chữ), `url-config.ts` (endpoints reading-service), `app.routes.ts` (routing mới)
- Cài đặt thêm: font Merriweather/Lora từ Google Fonts vào `index.html`
- Viết lại: `styles.css` với 4 palette Modern Minimalist Story Theme + Reader CSS Variables

### Phase 2 — Entity Layer
- Scaffold tất cả `libs/entities/*` với `models/` và `services/` rỗng theo Nx library pattern
- Triển khai từng service theo thứ tự ưu tiên: `novel` → `chapter` → `reading` → `library` → `review-comment` → `wallet` → `discovery`
- Pattern mỗi entity service:
  ```typescript
  @Injectable({ providedIn: 'root' })
  export class NovelService {
    private api = inject(ApiService);
    getList(params?) { return this.api.get(urlConfig.novels.list, { params }); }
    getDetail(id: string) { return this.api.get(urlConfig.novels.detail(id)); }
    // ...
  }
  ```

### Phase 3 — UI Component Layer
- Scaffold các Nx lib trong `libs/ui` cho components mới: `story-cards`, `reader-shell`, `reader-toolbar`, `chapter-nav`
- Ưu tiên:
  1. `novel-card` (card dọc + card ngang cho list)
  2. `sidebar-menu` (viết lại với menu truyện chữ)
  3. `shared-header` (viết lại với search bar + coin balance)
  4. `reader-shell` (layout Distraction-free cho trình đọc)
  5. `reader-toolbar` (floating: font, size, theme, toc)

### Phase 4 — Feature Pages
Thứ tự triển khai theo business priority:
1. `features/discovery` — Trang chủ (Trending hero, BXH, gợi ý, thể loại)
2. `features/novel-detail` — Chi tiết truyện (Header, Mục lục chương, Review, Bình luận)
3. `features/reader` — Trình đọc chương (Zen mode, Inline paragraph comments, Next/Prev nav)
4. `features/search` — Tìm kiếm & bộ lọc đa chiều
5. `features/library` — Tủ sách cá nhân (4 shelf system + custom)
6. `features/wallet` — Nạp xu & Mở khoá chương VIP
7. `features/author-studio` — Viết, đăng chương, thống kê, doanh thu
8. `features/settings` — Tùy chỉnh reader (font, size, theme, layout)

---

## 10. QUY TẮC CODE PATTERN BẮT BUỘC

### 10.1 Angular Standalone + Signals (KHÔNG dùng NgModule, KHÔNG dùng BehaviorSubject)
```typescript
@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'fe-novel-card',
  templateUrl: './novel-card.component.html',
  styleUrls: ['./novel-card.component.css'],
})
export class NovelCardComponent {
  @Input() novel!: Novel;
  // Dùng Signal input khi Angular 17+ nếu phù hợp
}
```

### 10.2 Facade Pattern cho Feature State
```typescript
@Injectable({ providedIn: 'root' })
export class NovelFacade {
  private novelService = inject(NovelService);

  // State as Signals
  private _novels = signal<Novel[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Public Readable Signals
  novels = this._novels.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // Actions
  loadNovels(params?: NovelListParams) {
    this._loading.set(true);
    this.novelService.getList(params).subscribe({
      next: (res) => { this._novels.set(res.data); this._loading.set(false); },
      error: (err) => { this._error.set(err.message); this._loading.set(false); }
    });
  }
}
```

### 10.3 CSS — Dùng CSS Custom Properties, KHÔNG hardcode px
```css
/* ĐÚNG */
.novel-card-title {
  font-size: var(--type-body-lg);
  font-weight: var(--font-weight-strong);
  color: var(--color-text-base);
}

/* SAI */
.novel-card-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
}
```

### 10.4 Lazy Loading bắt buộc cho tất cả Feature routes
```typescript
// SAI — import trực tiếp
import { DiscoveryComponent } from '@fe/features/discovery';
{ path: 'discovery', component: DiscoveryComponent }

// ĐÚNG — dynamic import + loadChildren
{
  path: 'discovery',
  loadChildren: () => import('@fe/features/discovery').then(m => m.discoveryRoutes)
}
```

---

*Bản khảo sát hoàn tất. Tài liệu này cùng với `reading-service-design.md` và `schema.prisma` cùng thư mục cung cấp đầy đủ ngữ cảnh để lập kế hoạch và triển khai `reading-web-client`.*