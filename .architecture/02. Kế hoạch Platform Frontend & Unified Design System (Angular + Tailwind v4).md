# 02. Kế hoạch Platform Frontend & Unified Design System (Angular + Tailwind v4)

> **Phạm vi tài liệu:** Kế hoạch xây dựng nền tảng giao diện dùng chung (**`platform-frontend`**) cho **toàn bộ 6 ứng dụng client** trong hệ sinh thái `social-platform-workspace`:
> 1. `fe-iam` (`frontend/iam-web-client`, port 4200) - Landing page giới thiệu & Account portal quản lý hồ sơ cá nhân.
> 2. `fe-social` (`frontend/social-web-client`, port 4201) - Mạng xã hội, bảng tin, tương tác creator và người theo dõi.
> 3. `fe-video` (`frontend/video-web-client`, port 4202) - Nền tảng video dài, phát trực tiếp, rạp chiếu nội dung.
> 4. `fe-shop` (`frontend/shop-web-client`, port 4203) - Thương mại điện tử xã hội, sản phẩm, giỏ hàng, thanh toán.
> 5. `fe-stories` (`frontend/stories-web-client`, port 4204) - Nội dung khoảnh khắc ngắn 24h, reels nhanh.
> 6. `fe-portfolio` (`frontend/portfolio-web-client`, port 4205) - Hồ sơ creator, showcase tác phẩm công khai.
>
> **Tuân thủ định hướng bảo mật & SSO (`target-architecture-plan.md`):**
> - **Nguyên tắc bất biến:** Trình duyệt **tuyệt đối không cầm access token hay refresh token**; xóa sạch token khỏi LocalStorage/SessionStorage.
> - **Mô hình BFF (RFC 10017):** Mọi tương tác xác thực đi qua Gateway BFF bằng HttpOnly Secure session cookie.
> - **Giao diện xác thực:** Đăng ký, đăng nhập, Passkey, TOTP, Social login do **Keycloak Login Theme** đảm nhận. `fe-iam` đóng vai trò Landing Page đón đầu và Account Portal sau đăng nhập.

---

## 1. Triết lý Thiết kế: "Đồng bộ Tuyệt đối Kết cấu — Linh hoạt Tùy biến Màu sắc"

Để người dùng khi chuyển đổi qua lại giữa 6 ứng dụng cảm thấy như đang trải nghiệm **cùng một nền tảng thống nhất**, Design System đặt ra nguyên tắc bất di bất dịch:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   BẤT BIẾN 100% TRÊN CẢ 6 REPO CLIENT                           │
│  - Typography & Font (Outfit, toàn bộ hierarchy từ Display đến Micro)            │
│  - Spacing Scale (Hệ lưới 4px: 4, 8, 12, 16, 24, 32, 48, 64px)                   │
│  - Responsive Breakpoints & Container Widths (sm, md, lg, xl, 2xl)               │
│  - Component Primitives (Button, Input, Modal, Toast, Drawer, Card, Avatar,...) │
│  - Border Radius, Elevation Shadows, Z-index layers, Animation Timings           │
│  - Mô hình Auth BFF (Cookie phiên, không token ở client)                         │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                        CHỈ CÓ 1 ĐIỂM TÙY BIẾN DUY NHẤT
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│               THEME PALETTE (BẢNG MÀU THƯƠNG HIỆU THEO TỪNG DOMAIN)              │
│  Mỗi repo chỉ cấu hình bộ biến màu Semantic OKLCH (--color-primary, accent):     │
│  - IAM       : Deep Indigo / Violet (Bảo mật, danh tính)                          │
│  - Social    : Electric Blue / Cyan (Năng động, kết nối)                         │
│  - Video     : Crimson / Cinematic Dark (Thị giác media)                         │
│  - Shop      : Emerald / Mint (Thương mại, tin cậy)                              │
│  - Stories   : Sunset Coral / Amber Gradient (Khoảnh khắc, sáng tạo)             │
│  - Portfolio : Monochrome Luxury / Gold Accent (Đẳng cấp creator)                │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Kiến trúc Gói Thư viện `platform-frontend`

Thư viện được tổ chức thành 2 gói độc lập:

```
platform-frontend/
├── packages/
│   ├── ui/                           # UI Design System & Component Library
│   │   ├── src/
│   │   │   ├── tokens/               # Design tokens (Typography, Spacing, Shadows, Radii)
│   │   │   ├── components/           # Angular Standalone Components (Button, Input, Modal, Card,...)
│   │   │   ├── directives/           # Ripple, ClickOutside, AutoFocus, Tooltip
│   │   │   ├── pipes/                # FormatNumber, Truncate, TimeAgo
│   │   │   ├── styles/               # preset.css (Tailwind v4 preset & CSS reset)
│   │   │   └── index.ts
│   │   └── package.json
│   ├── frontend-core/                # Client Core & BFF Auth SDK
│   │   ├── src/
│   │   │   ├── auth/                 # AuthClient (Session polling, login/logout redirect BFF)
│   │   │   ├── http/                 # Interceptors (withCredentials, W3C traceparent, x-request-id)
│   │   │   ├── errors/               # RFC 9457 Problem Details UI error mapper
│   │   │   └── state/                # Signal-based UserSessionStore
│   │   └── package.json
│   └── ui-storybook/                 # Storybook tài liệu hóa trực quan
├── pnpm-workspace.yaml
└── package.json
```

---

## 3. Kiến trúc Auth Client & BFF Integration (`@daccuong-uit/frontend-core`)

Tuân thủ nghiêm ngặt **RFC 10017 (OAuth 2.0 for Browser-Based Apps)**:

### 3.1. Nguyên tắc Không Lưu Token
- Trình duyệt **tuyệt đối không lưu giữ Access Token hay Refresh Token** trong `localStorage`, `sessionStorage` hay biến JavaScript.
- Tất cả request từ Frontend sang Gateway đi qua cùng origin (nhờ Caddy reverse proxy `/api/*`) hoặc gửi kèm cookie phiên `HttpOnly; Secure; SameSite=Lax`.

### 3.2. Cơ chế Hoạt động của `AuthClient`
Module `AuthClient` trong `@daccuong-uit/frontend-core` chỉ giao tiếp với các endpoint phiên của Gateway BFF:
- `authClient.getSession()`: Gọi `GET /api/auth/session`.
  - Nếu đã đăng nhập: Nhận `{ isAuthenticated: true, user: { sub, name, email, roles } }`.
  - Nếu chưa đăng nhập: Nhận `{ isAuthenticated: false, user: null }`.
- `authClient.login(returnUrl?)`: Chuyển hướng `window.location.href = '/api/auth/login?redirect=' + encodeURIComponent(returnUrl)`. Gateway BFF sẽ khởi tạo OIDC PKCE flow chuyển tiếp sang Keycloak login page.
- `authClient.logout()`: Gọi `POST /api/auth/logout`. Gateway hủy session trong Redis, kích hoạt Keycloak Back-Channel Logout và chuyển hướng người dùng về trang chủ.

### 3.3. HTTP Interceptor Chuẩn hóa
Angular HttpInterceptor trong `@daccuong-uit/frontend-core` tự động:
1. Thiết lập `withCredentials: true` trên mọi request API.
2. Sinh hoặc truyền tiếp header `traceparent` (chuẩn W3C Trace Context) và `x-request-id` để liên kết log với backend.
3. Khi nhận mã phản hồi `401 Unauthorized` từ Gateway, tự động kích hoạt `authClient.login()` mà không gây gián đoạn ứng dụng.
4. Bắt lỗi `400 Bad Request` dạng RFC 9457 `application/problem+json` và tự động ánh xạ vào các form fields tương ứng.

---

## 4. Quy chuẩn Giao diện Dùng chung 100% (Shared Standards)

### 4.1. Typography & Font Family
- **Font chữ duy nhất:** `Outfit` (fallback: `system-ui, -apple-system, sans-serif`).
- **Thang kích thước tiêu chuẩn:**

| Cấp bậc | Cỡ chữ (`rem` / `px`) | Line-Height | Font Weight | Mục đích sử dụng |
| --- | --- | --- | --- | --- |
| `display` | `2.5rem` (40px) | `1.15` | Bold (700) | Banner hero trang landing |
| `title` | `2.0rem` (32px) | `1.2` | Bold (700) | Tiêu đề trang chính (Page Title) |
| `heading` | `1.5rem` (24px) | `1.25` | Semi-bold (600) | Tiêu đề phân đoạn lớn (Section Header) |
| `body-lg` | `1.25rem` (20px) | `1.4` | Medium (500) | Đoạn mở đầu nổi bật, phụ đề |
| `body` | `1.0rem` (16px) | `1.5` | Regular (400) | Nội dung văn bản chính, thẻ bài viết |
| `label` | `0.875rem` (14px) | `1.4` | Medium (500) | Label form, nút bấm, menu |
| `caption` | `0.75rem` (12px) | `1.4` | Regular (400) | Timestamp, mô tả phụ, gợi ý form |
| `micro` | `0.625rem` (10px) | `1.3` | Regular (400) | Badge đếm số nhỏ, thông số kỹ thuật |

### 4.2. Spacing Scale (Hệ lưới 4px Base Grid)
Toàn bộ padding, margin, gap của mọi component tuân thủ hệ số của 4px:
```css
:root {
  --space-1: 0.25rem;  /* 4px  - Khoảng cách icon và text */
  --space-2: 0.5rem;   /* 8px  - Padding compact, gap button group */
  --space-3: 0.75rem;  /* 12px - Padding input standard */
  --space-4: 1.0rem;   /* 16px - Padding card cơ bản, gap lưới */
  --space-6: 1.5rem;   /* 24px - Khoảng cách giữa các card/widget */
  --space-8: 2.0rem;   /* 32px - Padding modal/dialog lớn */
  --space-12: 3.0rem;  /* 48px - Khoảng cách giữa các section lớn */
  --space-16: 4.0rem;  /* 64px - Hero section spacing */
}
```

### 4.3. Responsive Breakpoints & Container Layout
```css
--breakpoint-sm: 640px;   /* Mobile landscape, phablet */
--breakpoint-md: 768px;   /* Tablet portrait */
--breakpoint-lg: 1024px;  /* Tablet landscape, laptop tiêu chuẩn */
--breakpoint-xl: 1280px;  /* Desktop màn hình lớn */
--breakpoint-2xl: 1536px; /* Ultra-wide displays */
```
- **Quy chuẩn hiển thị:**
  - `Mobile (< 768px)`: Navigation chuyển thành Bottom Nav Bar hoặc Drawer trượt; Padding trang chuẩn là `16px`.
  - `Tablet (768px - 1023px)`: Sidebar dạng Mini-rail (chỉ icon); Padding trang là `24px`.
  - `Desktop (>= 1024px)`: Sidebar mở rộng đầy đủ (Fixed width 260px); Padding trang là `32px`.

### 4.4. Thư viện Component Primitives (Angular Standalone Components)
1. **Actions:** `<ui-button>` (Solid, Outline, Ghost, Danger), `<ui-icon-button>`, `<ui-button-group>`.
2. **Forms & Inputs:** `<ui-input>`, `<ui-textarea>`, `<ui-select>`, `<ui-checkbox>`, `<ui-radio>`, `<ui-switch>`, `<ui-form-field>` (tự render lỗi từ RFC 9457).
3. **Feedback:** `UiToastService` (ngx-sonner), `<ui-dialog>` / `<ui-modal>` (glassmorphism), `<ui-drawer>`, `<ui-skeleton>`, `<ui-spinner>`, `<ui-alert>`.
4. **Data Display:** `<ui-card>`, `<ui-avatar>`, `<ui-badge>`, `<ui-tabs>`, `<ui-pagination>` (kết nối trực tiếp `PaginationMeta`).
5. **App Shell:** `<ui-app-shell>` (Header, Sidebar, Content, MobileNav).

---

## 5. Cơ chế Cấu hình Màu sắc Riêng biệt cho 6 Repo (Theming)

Mọi component trong `@daccuong-uit/ui` chỉ sử dụng CSS Semantic Tokens:

```css
:root {
  --color-primary: oklch(0.55 0.22 270);
  --color-primary-hover: oklch(0.5 0.22 270);
  --color-primary-active: oklch(0.45 0.22 270);
  --color-primary-subtle: oklch(0.95 0.05 270);
  --color-accent: oklch(0.65 0.2 300);

  --color-bg-base: oklch(0.98 0.01 260);
  --color-bg-surface: oklch(1.0 0 0);
  --color-border-subtle: oklch(0.9 0.02 260);
  --color-border-strong: oklch(0.8 0.03 260);

  --color-success: oklch(0.65 0.2 145);
  --color-warning: oklch(0.75 0.18 85);
  --color-danger: oklch(0.55 0.22 25);
  --color-info: oklch(0.6 0.18 210);
}
```

### Bảng Phối màu Đặc trưng cho 6 Repo Client:
| Ứng dụng | Domain Nghiệp vụ | Mã màu `--color-primary` (OKLCH) | Phong cách thương hiệu |
| --- | --- | --- | --- |
| **`fe-iam`** | Landing & Account Portal | `oklch(0.55 0.22 270)` *(Deep Indigo/Violet)* | Nghiêm túc, an tâm, định danh |
| **`fe-social`** | Bảng tin, Tương tác | `oklch(0.60 0.20 240)` *(Electric Blue/Cyan)* | Năng động, kết nối cộng đồng |
| **`fe-video`** | Video, Rạp chiếu | `oklch(0.58 0.24 25)` *(Cinematic Crimson)* | Sâu lắng, thu hút thị giác nghe nhìn |
| **`fe-shop`** | Cửa hàng, Giỏ hàng | `oklch(0.62 0.20 160)` *(Emerald/Mint Green)* | Tươi mới, tin cậy, thương mại |
| **`fe-stories`** | Khoảnh khắc 24h, Reels | `oklch(0.65 0.22 45)` *(Sunset Coral/Orange)* | Sáng tạo, tươi trẻ, tức thời |
| **`fe-portfolio`** | Showcase Creator | `oklch(0.70 0.18 85)` *(Monochrome & Gold)* | Tinh tế, đẳng cấp, cá nhân hóa |

---

## 6. Hướng dẫn Tích hợp vào Repo Client

```css
/* Trong apps/web/src/styles.css của từng client */
@import 'tailwindcss';
@import '@daccuong-uit/ui/preset.css';

:root {
  --color-primary: oklch(0.60 0.20 240); /* Chỉ cấu hình màu theo bảng trên */
}
```

```typescript
// Trong app.config.ts của từng client
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bffAuthInterceptor } from '@daccuong-uit/frontend-core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([bffAuthInterceptor])),
  ]
};
```
