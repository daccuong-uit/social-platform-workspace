# Landing page `reals.id` — Kế hoạch viết lại

> **Trạng thái:** bản kế hoạch để duyệt, chưa có dòng code nào được đổi.
> **Phạm vi:** `IamLandingComponent` (selector `iam-landing`).
> **Đầu ra:** 3 file `iam-landing.component.ts`, `iam-landing.component.html`, `iam-landing.component.css`.
> **Nguyên tắc làm việc:** dựng cấu trúc chuẩn trước với nội dung giữ chỗ, đổ nội dung cũ vào sau (Phase 3). Không kế thừa cấu trúc của bản demo.
> **Phiên bản:** v2, đã áp dụng phản hồi của bạn (Angular 21.2, theme Modern Minimalist, chưa có SSO thật). Mục 11 ghi rõ cái gì đã chốt và cái gì còn mở.

---

## 0. Tóm tắt

Bản hiện tại là một **slide deck cuộn ngang** nhét trong một file 870 dòng (template, CSS, dữ liệu, logic chung một chỗ). Nó không phải landing page: không cuộn dọc, không có SEO, không có section giải thích sản phẩm, không dùng được bằng con lăn chuột. Kế hoạch này thay bằng một landing page cuộn dọc theo chuẩn hiện tại.

| # | Quyết định | Lý do |
|---|---|---|
| 1 | Một trang cuộn dọc, 6 section + footer | Con lăn chuột, bàn phím, deep link, SEO và trình đọc màn hình đều hoạt động đúng |
| 2 | Tách 3 file bằng `templateUrl` + `styleUrl` | Dễ đọc, dễ review, HTML và CSS có tooling riêng |
| 3 | Theme **Modern Minimalist** (theme-factory, bạn đã chọn) | Bốn màu xám + DejaVu Sans; trang sáng, band Charcoal đảo màu ở hai chỗ. Xem mục 3 |
| 4 | Không thêm màu ngoài theme | Các không gian phân biệt bằng tên, icon, hình minh họa và vị trí, không bằng màu |
| 5 | Một điểm nhấn duy nhất: **Space Switcher** ở hero | Diễn tả "một tài khoản, nhiều không gian" bằng hình, thay cho gradient chữ |
| 6 | Nội dung có "cổng xác minh" (`verified`) | Câu nào chưa kiểm chứng thì không lên production |
| 7 | Thứ tự làm: skeleton chuẩn → section → đổ nội dung cũ → hoàn thiện | Đúng yêu cầu "chuẩn trước, fill sau" |

**Thay đổi so với v1 (do phản hồi của bạn):**

- Theme đổi từ Ember Night (tối, coral) sang **Modern Minimalist** (sáng, xám, DejaVu Sans). Mục 3, token ở 7.5, mục 5-6 đã viết lại.
- **Chưa có SSO thật** (mỗi app tự giữ token trong localStorage): mọi câu hứa "đăng nhập một lần" đã bị bỏ (4.2, 8.2, 8.3).
- Trạng thái "đang kiểm tra phiên" suy ra từ `user()?.id === 'loading'`, **không cần sửa `AuthService`**.
- Angular 21.2: bỏ mọi phương án dự phòng cho phiên bản cũ.

**Còn cần bạn xác nhận (mục 11.2):** (A) cách cấp URL không gian qua `window.__APP_CONFIG__`, (B) đổi nút chính hero sang `/auth/register` và cho biết landing mount ở route nào, (C) có muốn màu điểm nhấn cho từng không gian không, (D) ảnh chia sẻ phải là file thật.

---

## 1. Chẩn đoán bản demo (vì sao không dựa vào cấu trúc cũ)

Số dòng tham chiếu tới file `iam-landing_component.ts` đã tải lên.

| # | Vấn đề | Bằng chứng | Bản mới xử lý bằng |
|---|---|---|---|
| 1 | **Không cuộn được bằng con lăn chuột.** Trang khóa `overflow:hidden`, nội dung cuộn ngang, thanh cuộn bị ẩn. Chuột thường chỉ phát lệnh cuộn dọc nên không có gì di chuyển | `:host` dòng 169-172; `.showcase-viewport` dòng 323-329 | Cuộn dọc tự nhiên, không khóa `overflow` |
| 2 | **Bộ đếm và nút "Tiếp" sai.** Hero và slide Social cùng có chỉ số 0 nên cùng hiện "1 / 6". Nút "Tiếp" bật `disabled` khi `=== slides.length`, mà chỉ số tối đa là `slides.length - 1`, nên **không bao giờ bị vô hiệu** | dòng 151-161, 851-857 | Bỏ hẳn slider; scroll spy theo section |
| 3 | **Bug biến CSS:** template chỉ gán `--accent`, nhưng gradient nền đọc `--accent-rgb` (không ai gán) nên mọi slide đều rơi về màu coral mặc định | dòng 102, 492 | Không còn biến màu theo slide; màu chỉ đến từ token của theme |
| 4 | **Tương phản không đạt WCAG AA** (đã tính, xem mục 3.6): chữ trắng trên nút ember chỉ **3.21:1**; trên accent Sky **2.14:1**, Amber **2.15:1**, Emerald **2.54:1**; chữ phụ `#64748b` **4.03:1** ở cỡ 10-12px | `.btn-launch` dòng 594-606, `.stat-lbl`, `.qc-badge` | Nút chính Charcoal + chữ trắng (9.90:1); chữ tối thiểu 14px |
| 5 | **Cỡ chữ quá nhỏ:** 0.65rem (~10px), 0.72rem (~11.5px), 0.75rem | dòng 469, 486, 523 | Thang chữ có sàn 14px |
| 6 | **Không có trạng thái focus**, không có `prefers-reduced-motion`; `scroll-behavior: smooth` ép cứng | toàn bộ CSS | `:focus-visible` toàn cục; tôn trọng reduced motion |
| 7 | **Điều hướng sai ngữ nghĩa:** nav là `<button>` không có URL/hash nên không chia sẻ được liên kết; `<footer>` dùng để chứa nút điều khiển slider | dòng 35-43, 147-165 | Nav là `<a href>` tới section; `<footer>` là footer thật |
| 8 | **Thao tác DOM trực tiếp:** `document.querySelector('.showcase-viewport')` ba lần trong khi `#showcaseContainer` khai báo nhưng không dùng; vị trí tính từ `window.innerWidth` | dòng 61, 843, 846, 859, 866 | `viewChildren`/`ElementRef`, IntersectionObserver |
| 9 | **URL cứng `http://localhost:42xx`** nằm trong component | dòng 740, 760, 780, 800, 820 | Gom về một khối cấu hình (mục 7, 11) |
| 10 | **Tất cả trong một file**, `*ngFor` không `trackBy`, còn `CommonModule` | dòng 2, 25, 37, 88, 99, 121, 136 | 3 file, `@for ... track`, standalone + OnPush |
| 11 | **Không có SEO, không có i18n, không có trạng thái loading của auth** | toàn bộ file | Mục 7.6, 7.7, Phase 5-6 |
| 12 | **Nội dung "thống kê" thực ra là chi tiết kỹ thuật** (`HLS.js / MediaSource`, `Signals / RxJS`, `Micro-Frontend`) và có con số chưa kiểm chứng (`< 200ms`) | dòng 743-744, 763-764 | Chuyển sang mục "Người xây dựng"; số liệu chưa đo thì không hiển thị |

---

## 2. Mục tiêu và tiêu chí chất lượng

**Trang này dùng để làm gì:** đưa người dùng tới đúng không gian của họ (hoặc tới đăng nhập/đăng ký) trong vài giây, đồng thời giải thích ngắn gọn reals.id là gì.

**Ai dùng:**
1. Người đã có tài khoản: muốn vào Social/Video/Shop/Stories ngay.
2. Người mới: cần hiểu "một tài khoản cho mọi không gian" và bấm tạo tài khoản.
3. Người xem hồ sơ kỹ thuật của tác giả (portfolio, kiến trúc dự án).

**Hành động chính:** Tạo tài khoản (khách) / Mở không gian (đã đăng nhập). **Hành động phụ:** Đăng nhập, xem portfolio.

**Sàn chất lượng (không thương lượng):**

- Responsive từ 320px, không cuộn ngang (WCAG 1.4.10 Reflow); dùng được khi zoom 200%.
- WCAG 2.2 AA: tương phản, focus nhìn thấy, điều khiển bằng bàn phím, mục tiêu chạm tối thiểu 24px (đề xuất 44px cho nút chính).
- `prefers-reduced-motion` được tôn trọng; không có chuyển động tự chạy ngoài một chuỗi mở đầu ở hero.
- Ngưỡng Core Web Vitals mức "tốt" của Google: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.
- Không có chuỗi `localhost` trong bundle production.

---

## 3. Theme: Modern Minimalist (theme-factory, bạn đã chọn)

### 3.1 Cách áp dụng lên web

Modern Minimalist là preset của theme-factory: bốn màu xám và cặp phông DejaVu Sans Bold / DejaVu Sans. Preset viết cho slide, nên mục này quy đổi sang web **mà không thêm màu hay phông ngoài theme**.

- Ember (coral) và năm màu riêng của từng không gian ở bản v1 **bị loại**. Các không gian phân biệt nhau bằng tên, icon, hình minh họa và vị trí.
- Preset mô tả White là màu chữ và nền sạch (dùng trên nền Charcoal của slide). Trên web đảo vai trò: nền trắng, chữ Charcoal; Charcoal/White chỉ đảo lại ở các band tối (3.5).
- Mọi giá trị còn lại (nền xen kẽ, chữ phụ, hover) đều **pha từ bốn màu này** bằng `color-mix()`, không thêm mã hex mới.

### 3.2 Bảng màu

| Tên | Hex | Vai trò trên web |
|---|---|---|
| Charcoal | `#36454F` | Chữ chính, nút chính, band tối (Người xây dựng, footer), vòng focus trên nền sáng |
| Slate Gray | `#708090` | Viền thành phần tương tác, icon phụ, chữ **lớn** (≥ 24px, hoặc ≥ 18.66px đậm). **Không** dùng cho chữ thường, **không** đặt trên nền Charcoal |
| Light Gray | `#D3D3D3` | Đường kẻ 1px trang trí; chữ phụ và đường kẻ trên band Charcoal; gốc của nền xen kẽ |
| White | `#FFFFFF` | Nền trang; chữ và vòng focus trên band Charcoal |

Giá trị dẫn xuất:

| Token | Công thức | Kết quả | Dùng cho |
|---|---|---|---|
| `--paper-2` | `color-mix(in srgb, var(--light-gray) 35%, var(--white))` | `#F0F0F0` | Nền section xen kẽ |
| `--paper-3` | cùng công thức, 55% | `#E7E7E7` | Hover chip/hàng, câu hỏi FAQ đang mở |
| `--text-md` | `color-mix(in srgb, var(--charcoal) 82%, var(--white))` | `#5A666F` | Chữ phụ, chú thích |
| `--charcoal-hover` | `color-mix(in srgb, #000 12%, var(--charcoal))` | `#303D46` | Hover nút chính |

### 3.3 Typography

- **Tiêu đề:** DejaVu Sans Bold. **Thân bài:** DejaVu Sans Regular. Đúng theo theme.
- Chỉ dùng hai độ đậm (400 và 700). Phân cấp bằng cỡ chữ, khoảng cách và đường kẻ; **không** khai báo 500/600 vì trình duyệt sẽ tự tạo chữ đậm giả.
- **Tiếng Việt:** đã kiểm tra bằng fontTools trên file Regular và Bold. 140 ký tự thử (toàn bộ khối U+1EA0-1EF9, Ă Â Đ Ê Ô Ơ Ư cả dạng thường, `₫`, nháy cong, gạch nối dài, dấu ba chấm) đều có glyph, không ký tự nào phải rơi về phông dự phòng.
- **Phải tự host.** DejaVu Sans không phải phông web sẵn có và thường không được cài trên Windows/macOS. File gốc nặng 742 KB nên phải subset (Latin, Latin-ext, Việt). Đã đo: khoảng 27.6 KB (Regular) và 25.7 KB (Bold) ở định dạng WOFF; WOFF2 sẽ nhỏ hơn (chưa đo được vì môi trường thiếu `brotli`). Giữ file giấy phép DejaVu đi kèm khi phân phối.
- `@font-face` khai báo ở **style toàn cục của ứng dụng** (không nằm trong component), `font-display: swap`, preload hai file. Đây là điều kiện tiên quyết ngoài 3 file.
- Stack dự phòng: `"DejaVu Sans", Verdana, "Segoe UI", system-ui, sans-serif` (Verdana có bề ngang tương tự nên giảm nhảy layout khi đổi phông).
- DejaVu Sans khá rộng: độ dài dòng thân bài tối đa `58ch`.

### 3.4 Thang chữ, khoảng cách, hình khối

Chữ tiếng Việt xếp dấu chồng (ự, ể, ầ) nên **line-height của tiêu đề tối thiểu 1.2**.

| Token | Giá trị | Line-height | Dùng cho |
|---|---|---|---|
| `--fs-display` | `clamp(2.25rem, 1.5rem + 3.4vw, 4rem)` | 1.2, `letter-spacing: -0.01em` | h1 hero |
| `--fs-h2` | `clamp(1.625rem, 1.25rem + 1.6vw, 2.5rem)` | 1.25 | tiêu đề section |
| `--fs-h3` | `1.25rem` | 1.35 | tên không gian, bước |
| `--fs-lead` | `1.125rem` | 1.65 | đoạn dẫn |
| `--fs-body` | `1rem` | 1.65 | thân bài |
| `--fs-small` | `0.875rem` | 1.5 | chú thích (sàn 14px) |

- Thang khoảng cách bước 4px: `--sp-1: .25rem` … `--sp-12: 6rem`. Khoảng đệm dọc section: `clamp(4rem, 3rem + 5vw, 8rem)`.
- Phong cách tối giản: **không đổ bóng**. Ngăn cách bằng khoảng trắng, đường kẻ 1px (`--line`) và các band nền.
- Bo góc nhỏ, theo vai trò: `--r-sm: 4px` (chip), `--r-md: 8px` (nút, ô nhập), `--r-lg: 12px` (Switcher, panel).

### 3.5 Băng nền theo section

| Section | Nền | Chữ |
|---|---|---|
| Header (sticky) | Trắng, viền dưới 1px khi cuộn | Charcoal |
| Hero | Trắng | Charcoal |
| Các không gian | `--paper-2` | Charcoal |
| Cách hoạt động | Trắng | Charcoal |
| Người xây dựng | **Charcoal** (`.band--inverse`) | Trắng; phụ Light Gray |
| Hỏi đáp | Trắng | Charcoal |
| CTA cuối (khách) | `--paper-2` | Charcoal |
| Footer | **Charcoal** (`.band--inverse`) | Trắng; phụ Light Gray |

`.band--inverse` đảo bộ token (nền, chữ, đường kẻ, focus) trong phạm vi band, nên nút chính và liên kết tự đổi màu mà không cần class riêng.

### 3.6 Kiểm chứng tương phản (đã tính theo công thức WCAG 2.x)

| Cặp màu | Tỉ lệ | Kết quả |
|---|---|---|
| Charcoal trên White / `--paper-2` / Light Gray | 9.90 / 8.69 / 6.61 | AA |
| White trên Charcoal (nút chính, band tối) | 9.90 | AA |
| White trên `--charcoal-hover` | 11.16 | AA |
| Light Gray trên Charcoal (chữ phụ trên band tối) | 6.61 | AA |
| `--text-md` trên White / `--paper-2` | 5.89 / 5.17 | AA |
| Slate trên White / `--paper-2` (viền UI) | 4.05 / 3.56 | Đạt 3:1 cho UI và chữ lớn; **không đạt 4.5:1 cho chữ thường** |
| Slate trên Charcoal | 2.44 | **Không dùng** |
| Light Gray trên White (đường kẻ) | 1.50 | Chỉ trang trí, không dùng làm viền tương tác |

Focus: vòng 2px Charcoal trên nền sáng, White trên band Charcoal (cùng 9.90:1).

Bản cũ để đối chiếu: chữ trắng trên nút coral 3.21:1; `#64748b` trên `#0d0f12` 4.03:1.

### 3.7 Ngoài phạm vi v1 (nếu bạn muốn)

- **Màu điểm nhấn cho từng không gian** (ví dụ thanh 3px, nền nhạt): nằm ngoài theme nên mặc định **không có**. Nếu muốn, tôi sẽ đề xuất bảng màu, tính tương phản rồi thêm lại `Accent` vào `Space`.
- **Dark theme:** đảo lớp token ngữ nghĩa (nền Charcoal, chữ White). Phase 6.

---

## 4. Kiến trúc thông tin chuẩn

Cấu trúc này được dựng từ mục tiêu của trang (mục 2), **không** từ danh sách slide cũ. Nội dung cũ chỉ được đổ vào các ô đã có sẵn (mục 8).

### 4.1 Các section theo thứ tự cuộn

| # | `id` | Section | Mục đích | Thành phần chuẩn | CTA |
|---|---|---|---|---|---|
| 0 | (không có) | **Header** (sticky) | Điều hướng, trạng thái tài khoản | Logo, 4 liên kết nav, khối tài khoản, nút menu (mobile) | Đăng nhập / Tạo tài khoản, hoặc tên + Đăng xuất |
| 1 | `hero` | **Hero** | Nói reals.id là gì trong 5 giây | 1 `<h1>`, 1 đoạn dẫn, 2 nút, **Space Switcher** | Chính: Tạo tài khoản. Phụ: Xem các không gian |
| 2 | `spaces` | **Các không gian** | Cho biết mỗi không gian làm gì, mở thẳng vào | Rail cố định bên trái + panel cho từng không gian (tên, tóm tắt, 3-4 tính năng, hình minh họa, nút mở) | Mở Reals Social / Video / Shop / Stories |
| 3 | `how` | **Cách hoạt động** | Giải thích cách một tài khoản đi qua các không gian (mô tả trung lập, chưa hứa đăng nhập một lần) | 3 bước có đánh số (đây là chuỗi thật nên được phép đánh số); khối "Bảo mật và quyền riêng tư" (ẩn nếu chưa có nội dung đã xác minh) | (không) |
| 4 | `creator` | **Người xây dựng** | Giới thiệu tác giả + kiến trúc dự án | Hồ sơ ngắn, danh sách công nghệ, danh sách đặc điểm kiến trúc | Xem portfolio |
| 5 | `faq` | **Hỏi đáp** | Gỡ vướng trước khi người dùng bỏ đi | 4-6 câu, `<details>` gốc | (không) |
| 6 | `start` | **CTA cuối** (chỉ với khách) | Chốt hành động | 1 tiêu đề, 2 nút | Tạo tài khoản, Đăng nhập |
| 7 | (footer) | **Footer** | Điều hướng phụ, pháp lý | Logo, 3 nhóm liên kết, bản quyền | — |

Không có section "khách hàng nói gì" hay logo đối tác vì chưa có dữ liệu thật. Nếu sau này có, thêm dạng dữ liệu (`@if (proof.length)`), không viết cứng.

### 4.2 Ma trận trạng thái

| Trạng thái | Header | Hero | Switcher | Panel không gian | CTA cuối |
|---|---|---|---|---|---|
| **Đang kiểm tra phiên** (`user()?.id === 'loading'`) | Khung giữ chỗ **cùng kích thước** với khối tài khoản (tránh nhảy layout) | Giữ chỗ 2 nút | Hiển thị bình thường | Bình thường | Ẩn |
| **Khách** (`user() === null`) | Đăng nhập + Tạo tài khoản | Nút chính "Tạo tài khoản", phụ "Xem các không gian" | Chip cuộn tới panel tương ứng | Nút "Mở …": theo kiến trúc hiện tại, ứng dụng con tự kiểm tra token và chuyển sang trang đăng nhập của nó khi thiếu (cần xác nhận hành vi thật ở từng app) | Hiện |
| **Đã đăng nhập** (có `user`, `id` khác `'loading'`) | Tên hiển thị + Đăng xuất | Thay 2 nút bằng lời chào "Chào {tên}" và nút "Chọn không gian" | Chip là liên kết mở thẳng ứng dụng | Nút "Mở …" | Ẩn |

**Lưu ý về đăng nhập:** vì `localStorage` gắn theo origin và mỗi không gian là SPA riêng, đăng nhập ở reals.id **không** có nghĩa đã đăng nhập ở từng không gian. Landing vì vậy không dùng câu "không cần đăng nhập lại". Nếu `user.id === 'loading'` thì `displayName` không được hiển thị (email tạm là chuỗi rỗng).

### 4.3 Điều hướng

- Nav là `<a href="#...">` thật (có URL, chia sẻ được), tiêu điểm được chuyển tới tiêu đề section sau khi cuộn.
- Thanh nav đánh dấu mục hiện tại bằng `aria-current="location"`, cập nhật bằng IntersectionObserver (không dùng sự kiện `scroll`).
- Dưới 960px: nav gom vào một nút menu dạng disclosure (`aria-expanded`, đóng bằng Esc và khi chọn liên kết). Không cần bẫy focus vì không phải hộp thoại modal.

---

## 5. Wireframe và hướng căn lề

**Căn lề:** mặc định căn trái. Bản cũ căn giữa toàn bộ, vốn hợp với slide nhưng khó đọc với văn bản dài. Chỉ căn giữa tiêu đề và hai nút của CTA cuối.

### 5.1 Desktop (≥ 1200px)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ [R] reals.id    Không gian  Cách hoạt động  Người xây dựng  Hỏi đáp        │ sticky, 64px
│                                                   Đăng nhập  [Tạo tài khoản]│
├───────────────────────────────────────────────────────────────────────────┤
│ HERO                                                                      │
│                                                                           │
│  Một tài khoản.                       ┌─ SPACE SWITCHER ──────────────┐   │
│  Mọi không gian sáng tạo.             │ ┌──────────┐                  │   │
│                                       │ │ (R) Tài  │──┬─ Reals Social │   │
│  Một tài khoản reals.id cho           │ │ khoản    │  ├─ Reals Video  │   │
│  Social, Video, Shop và Stories.      │ └──────────┘  ├─ Reals Shop   │   │
│                                       │               └─ Reals Stories│   │
│  [Tạo tài khoản]  [Xem các không gian]│  chip đang chọn đảo màu       │   │
│                                       └───────────────────────────────┘   │
├───────────────────────────────────────────────────────────────────────────┤
│ CÁC KHÔNG GIAN                                                            │
│ ┌────────────┐  ┌───────────────────────────────────────────────────┐     │
│ │ ● Social   │  │ Reals Social                        ┌───────────┐ │     │
│ │   Video    │  │ Tóm tắt một câu.                    │  hình     │ │     │
│ │   Shop     │  │ Mô tả ngắn.                         │  minh họa │ │     │
│ │   Stories  │  │ ✓ tính năng   ✓ tính năng           │  (CSS)    │ │     │
│ └────────────┘  │ [Mở Reals Social]                   └───────────┘ │     │
│  sticky rail    └───────────────────────────────────────────────────┘     │
│                 … panel Video, Shop, Stories nối tiếp phía dưới …         │
├───────────────────────────────────────────────────────────────────────────┤
│ CÁCH HOẠT ĐỘNG     1 Tạo tài khoản    2 Chọn không gian    3 Bắt đầu     │
│ (khối Bảo mật và quyền riêng tư: chỉ hiện khi có nội dung đã xác minh)    │
├───────────────────────────────────────────────────────────────────────────┤
│ NGƯỜI XÂY DỰNG     hồ sơ ngắn │ công nghệ │ kiến trúc      [Xem portfolio] │
├───────────────────────────────────────────────────────────────────────────┤
│ HỎI ĐÁP            ▸ câu hỏi 1   ▸ câu hỏi 2   ▸ câu hỏi 3 …              │
├───────────────────────────────────────────────────────────────────────────┤
│ CTA CUỐI (khách)   Bắt đầu với một tài khoản.  [Tạo tài khoản] [Đăng nhập]│
├───────────────────────────────────────────────────────────────────────────┤
│ FOOTER  logo │ Không gian │ Trang │ Tài khoản │ © năm                     │
└───────────────────────────────────────────────────────────────────────────┘
```

Băng nền theo từng section (trắng, xám nhạt, Charcoal đảo màu): xem 3.5.

### 5.2 Mobile (320-599px)

```
┌───────────────────────┐
│ [R] reals.id       [≡]│ 56px, menu disclosure
├───────────────────────┤
│ Một tài khoản.        │
│ Mọi không gian        │
│ sáng tạo.             │
│ Đoạn dẫn (≤ 3 dòng)   │
│ [Tạo tài khoản]       │ nút full-width, ≥ 44px
│ [Xem các không gian]  │
│ ┌───────────────────┐ │
│ │ (R) Tài khoản     │ │ Switcher xếp dọc:
│ │  ├ Reals Social   │ │ thẻ tài khoản trên,
│ │  ├ Reals Video    │ │ chip xếp lưới 2 cột
│ │  ├ Reals Shop     │ │
│ │  └ Reals Stories  │ │
│ └───────────────────┘ │
├───────────────────────┤
│ Panel Social (xếp dọc)│ không có rail; mỗi panel là một khối
│ Panel Video           │
│ …                     │
└───────────────────────┘
```

### 5.3 Điểm ngắt (mobile-first, `min-width`)

| Điểm | Thay đổi chính |
|---|---|
| `≥ 640px` | Lưới 2 cột cho danh sách tính năng, 3 bước xếp ngang |
| `≥ 960px` | Nav ngang thay cho menu; hero 2 cột; Rail cố định xuất hiện |
| `≥ 1200px` | Khung nội dung tối đa 1200px, khoảng cách section tối đa |

Media query không dùng được biến CSS, nên ba điểm trên được ghi thành hằng số trong chú thích đầu file CSS.

---

## 6. Rà soát chống mẫu chung

Đối chiếu bản kế hoạch với các mặc định dễ gặp của landing page tạo tự động (theo hướng dẫn frontend-design). Cột giữa là thứ bản cũ hoặc thói quen phổ biến sẽ làm.

| Khía cạnh | Mặc định dễ gặp | Quyết định cho reals.id |
|---|---|---|
| Nhấn nhá tiêu đề | Cả một cụm chữ tô gradient/in nghiêng (bản cũ làm ở câu "Mọi không gian sáng tạo.") | Tiêu đề **một màu, một kiểu**. Điểm nhấn thị giác là Space Switcher |
| Nhãn nhỏ viết hoa trên đầu section | "ECOSYSTEM" kiểu eyebrow (bản cũ có chip ở hero) | Bỏ. Tiêu đề đã đủ nói nội dung. Không dùng chữ hoa cách chữ |
| Số thứ tự 01-04 trang trí | Đánh số các thẻ song song (bản cũ có `0{{idx+1}}`) | Chỉ đánh số ở mục "Cách hoạt động" vì đó là chuỗi thật |
| Chuỗi meta phân cách dấu chấm | `Shorts · HLS Streaming · Watch` | Tách thành danh sách thật, mỗi ý một dòng |
| Mũi tên nối đuôi mọi nút (`→`, `↗`) | "Khám phá →" | Không thêm mũi tên. Mặc định mở trong cùng tab nên không cần biểu tượng "ra ngoài" |
| Lưới thẻ giống hệt nhau, cùng bo góc, cùng bóng | 4 thẻ bằng nhau | Rail + panel dài, Switcher, danh sách; bo góc theo vai trò; không bóng |
| Nền trắng + thẻ xám nhạt bằng nhau + bóng đổ (dạng "tối giản" hay gặp) | Nền `#fff`, lưới thẻ giống hệt nhau, bóng mờ | Không thẻ nổi, không bóng: ngăn cách bằng khoảng trắng, đường kẻ 1px và hai band Charcoal đảo màu. Khác biệt đến từ chữ (cỡ lớn, chỉ hai độ đậm) và từ Space Switcher |
| Hiệu ứng trượt/mờ dần cho từng khối khi cuộn | Reveal-on-scroll khắp nơi | **Không có.** Một chuỗi mở đầu ở hero; còn lại chỉ là phản hồi khi tương tác |
| Nhãn monospace nhỏ, URL thô | `localhost:4200/social` (bản cũ hiển thị) | Không hiển thị URL |
| Hero căn giữa, mọi thứ căn giữa | Căn giữa toàn trang | Căn trái; giữa chỉ ở CTA cuối |
| Ba cột "tính năng" có biểu tượng | Lưới icon-tiêu đề-mô tả | Không dùng ở landing này; tính năng nằm trong panel của từng không gian |

### 6.1 Chuyển động

| Chuyển động | Khi nào | Chi tiết |
|---|---|---|
| **Chuỗi mở đầu Switcher** | Một lần khi tải | Các đường nối từ thẻ tài khoản vẽ ra bốn chip lần lượt (trễ `calc(var(--i) * 90ms)`), tổng ≤ 700ms. Diễn đạt ý "một chìa, nhiều cửa" |
| Đảo màu chip | Rê chuột/focus vào chip | Chip đang chọn đảo sang nền Charcoal/chữ trắng, đường nối tới chip đó đậm lên; 200ms |
| Mục rail đang chọn | Khi scroll spy đổi | Thanh chỉ báo trượt 200ms |
| Mở FAQ, mở menu | Khi bấm | ≤ 200ms, chỉ dùng `opacity`/`transform` |
| **Reduced motion** | `prefers-reduced-motion: reduce` | Bỏ chuỗi mở đầu (hiển thị trạng thái cuối), tắt trượt mượt, giữ nguyên chuyển màu tức thời |

---

## 7. Kiến trúc kỹ thuật: 3 file

### 7.1 Cấu trúc và trách nhiệm

```
<thư mục hiện tại của component>/
├── iam-landing.component.ts     # trạng thái, dữ liệu nội dung (kiểu + hằng số), hành vi
├── iam-landing.component.html   # markup ngữ nghĩa, control flow, ARIA
└── iam-landing.component.css    # token, layer, thành phần, chuyển động
```

| File | Chịu trách nhiệm | **Không** được chứa |
|---|---|---|
| `.ts` | `@Component` (`templateUrl`, `styleUrl`), signals, `computed`, quan sát cuộn, SEO tag, gọi `AuthService`, khối dữ liệu nội dung có kiểu | HTML, CSS, màu hex, thao tác DOM ngoài phạm vi host |
| `.html` | Cấu trúc trang, landmark, thuộc tính ARIA, vòng lặp `@for`, rẽ nhánh `@if`, sprite icon | Logic, `style=""` tĩnh, cỡ chữ/màu viết cứng |
| `.css` | Toàn bộ giao diện, token, responsive, chuyển động | Nội dung chữ, logic; không có `!important` |

> Tên file: bản tải lên là `iam-landing_component.ts` (dấu gạch dưới, có thể do quá trình tải lên). Kế hoạch dùng quy ước Angular `iam-landing.component.*`. **Nếu đổi tên, cập nhật đường dẫn import trong file routes** (`loadComponent`/`component`). Nên lazy-load route này bằng `loadComponent`.

Nếu file `.ts` phình quá ~300 dòng vì khối dữ liệu, tách riêng `iam-landing.content.ts` là bước sau (không thuộc yêu cầu 3 file hiện tại). Dữ liệu được viết dạng hằng số có kiểu ngay từ đầu để việc tách đó chỉ là cắt-dán.

### 7.2 Công nghệ áp dụng

| Lĩnh vực | Kỹ thuật | Áp dụng ở đâu | Phase |
|---|---|---|---|
| Component | Standalone, `ChangeDetectionStrategy.OnPush`, `inject()`, metadata `host` | `.ts` | 1 |
| Trạng thái | `signal`, `computed`; **không** dùng `effect` cho logic dẫn xuất | `.ts` | 1 |
| Template | Control flow `@if` / `@for (… track …)`; không `*ngIf`/`*ngFor`, không `CommonModule` | `.html` | 1 |
| Điều hướng | `RouterLink` cho `/auth/*`; anchor cuộn xử lý bằng `goTo()` (xem 7.3, vì `<base href>` làm `href="#x"` thuần có thể điều hướng sai) | `.ts`, `.html` | 2 |
| Icon | Sprite SVG nội tuyến (`<symbol>` + `<use href>`); tránh `fill="url(#id)"` trong SVG vì `<base href>` làm tham chiếu này hỏng trên một số trình duyệt | `.html` | 2 |
| Ảnh | `NgOptimizedImage` (`ngSrc`, `width`/`height`, `priority` chỉ cho ảnh LCP) khi có ảnh chụp thật; Phase 2 dùng hình minh họa thuần CSS | `.html` | 5 |
| Quan sát cuộn | `IntersectionObserver` cho scroll spy và đổ viền header; **không** dùng sự kiện `scroll` | `.ts` | 2 |
| Render an toàn SSR | `afterNextRender` cho mọi thứ động vào DOM/`matchMedia`/`IntersectionObserver` | `.ts` | 2 |
| CSS | Biến CSS (token), `@layer`, `clamp()` cho chữ, `dvh`, `color-mix()`, `:has()`, container query cho panel/Switcher, thuộc tính logic (`padding-inline`), `:focus-visible` | `.css` | 1-2 |
| Chuyển động | `transform`/`opacity` thuần CSS, `prefers-reduced-motion`; cuộn theo chiều thời gian (`animation-timeline`) chỉ là tùy chọn có `@supports` | `.css` | 4 |
| Trợ năng | Landmark, skip link, `aria-current`, `aria-expanded`, `<details>` gốc, `@media (forced-colors: active)` | cả 3 | 1-5 |
| SEO | `Title`, `Meta` (description, Open Graph, Twitter Card), canonical | `.ts` | 5 |
| Bảo mật | Xem 7.6 | `.ts` | 1-5 |
| i18n | Chuỗi tập trung trong khối dữ liệu, sẵn sàng đưa vào `$localize`/`i18n` | `.ts` | 6 |
| Kiểm thử | Unit (runner hiện có), axe, Playwright, Lighthouse CI (mục 10) | ngoài 3 file | 5 |

**Phiên bản Angular: ~21.2.0 (đã xác nhận).** `styleUrl`, control flow, `afterNextRender`, `@defer` và standalone dùng trực tiếp, không cần phương án dự phòng. Nếu ứng dụng chạy zoneless, mọi cập nhật trạng thái từ observer/`matchMedia` phải đi qua signal (kế hoạch đã làm vậy). `@defer (on viewport)` vẫn là **tùy chọn**: trang này chủ yếu tĩnh nên không bắt buộc, chỉ cân nhắc nếu sau này có phần nặng (ảnh chụp, video).

### 7.3 Đặc tả `.ts`

**Kiểu và hằng số (đầu file):** `SectionId`, `SpaceId`, `IconId`, `AuthState`, các interface `Space`, `Step`, `FaqItem`, `SecurityPoint`, `Creator`. Không có kiểu `Accent`: theme không có màu điểm nhấn (mục 3).

**Khung code:**

```ts
import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef,
  afterNextRender, computed, inject, signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';   // Angular 21.2: đã xác nhận import từ '@angular/common'
import { Meta, Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@fe/core';

type SectionId = 'hero' | 'spaces' | 'how' | 'creator' | 'faq' | 'start';
type SpaceId   = 'social' | 'video' | 'shop' | 'stories';
type AuthState = 'checking' | 'guest' | 'authed';
type IconId    = 'social' | 'video' | 'shop' | 'stories' | 'menu' | 'close' | 'check' | 'chevron';

interface Space {
  id: SpaceId;
  name: string;              // "Reals Social"
  role: string;              // nhãn ngắn ở rail/chip: "Mạng xã hội"
  summary: string;           // 1 câu, ngôn ngữ người dùng
  description: string;
  features: readonly string[];
  url: string;               // từ SPACE_URLS (window.__APP_CONFIG__.spaceUrls), KHÔNG viết cứng localhost (11.2 A)
  cta: string;               // "Mở Reals Social"
  icon: IconId;
}
interface Step          { title: string; body: string }
interface FaqItem       { q: string; a: string; verified: boolean }
interface SecurityPoint { title: string; body: string; verified: boolean }

@Component({
  selector: 'iam-landing',
  imports: [RouterLink],
  templateUrl: './iam-landing.component.html',
  styleUrl: './iam-landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closeMenu()' },
})
export class IamLandingComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly doc = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  // --- dữ liệu (đổ từ mục 8) ---
  readonly nav = NAV_LINKS;
  readonly spaces = SPACES;
  readonly steps = STEPS;
  readonly creator = CREATOR;
  readonly faq = FAQ.filter(f => f.verified);                 // cổng xác minh
  readonly securityPoints = SECURITY.filter(p => p.verified); // rỗng => không render khối
  readonly year = new Date().getFullYear();

  // --- trạng thái ---
  readonly user = this.auth.user;
  readonly authState = computed<AuthState>(() => {
    const u = this.user();
    if (u?.id === 'loading') return 'checking';   // checkAuth() đặt user tạm { id: 'loading' }
    return u ? 'authed' : 'guest';
  });
  readonly isChecking = computed(() => this.authState() === 'checking');
  readonly isAuthenticated = computed(() => this.authState() === 'authed');
  readonly displayName = computed(() => /* tên hiển thị, dự phòng "Thành viên" */);
  readonly initials = computed(() => /* 1-2 chữ cái, dự phòng "R" */);
  readonly activeSection = signal<SectionId>('hero');
  readonly activeSpace = signal<SpaceId>('social');
  readonly menuOpen = signal(false);
  readonly scrolled = signal(false);

  constructor() {
    this.applySeo();
    afterNextRender(() => this.observe());
  }

  goTo(id: string, event?: Event): void { /* xem hành vi bên dưới */ }
  previewSpace(id: SpaceId): void { this.activeSpace.set(id); }
  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu(): void { this.menuOpen.set(false); }
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);   // giữ hành vi cũ; nếu logout() bất đồng bộ thì await
  }

  private applySeo(): void { /* mục 7.6 */ }
  private observe(): void { /* hai IntersectionObserver, dọn trong destroyRef.onDestroy */ }
}
```

**Hành vi cần đúng:**

| Hàm | Yêu cầu |
|---|---|
| `goTo(id, ev)` | `preventDefault()`; tìm phần tử bằng `getElementById`; cuộn bằng `scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })` với `reduce` đọc từ `matchMedia('(prefers-reduced-motion: reduce)')`; sau đó `focus({ preventScroll: true })` vào phần tử có `data-focus-target` (tiêu đề `tabindex="-1"`); gọi `closeMenu()`. Cập nhật fragment bằng `router.navigate([], { fragment: id, replaceUrl: true })` **hoặc** bỏ qua nếu spike Phase 0 cho thấy xung đột với cấu hình router của shell |
| `observe()` | (1) Scroll spy: `IntersectionObserver` với `rootMargin: '-40% 0px -55% 0px'` trên các phần tử `[data-section]` trong host, cập nhật `activeSection`; tương tự cho panel `[data-space]` để cập nhật `activeSpace`. (2) Một phần tử `sentinel` đầu trang để bật `scrolled` (viền header). Ngắt kết nối khi component bị hủy. Chỉ truy vấn trong `host.nativeElement`, không truy vấn `document` toàn cục |
| `previewSpace(id)` | Chỉ đổi trạng thái hiển thị (chip đảo màu, chú thích) khi rê chuột/focus chip; **không** cuộn |
| `logout()` | Giữ hành vi bản cũ (đăng xuất rồi về `/auth/login`) |

### 7.4 Đặc tả `.html`

**Khung (rút gọn, thuộc tính ARIA là bắt buộc):**

```html
<!-- sprite icon: một lần, ẩn với công nghệ hỗ trợ -->
<svg class="sprite" aria-hidden="true" focusable="false">
  <symbol id="ic-social" viewBox="0 0 24 24">…</symbol>
  <!-- video, shop, stories, menu, close, check, chevron -->
</svg>

<a class="skip" href="#main" (click)="goTo('main', $event)">Bỏ qua đến nội dung chính</a>

<div class="sentinel" data-sentinel></div>

<header class="header" [class.header--scrolled]="scrolled()">
  <div class="container header__inner">
    <a class="brand" href="#hero" (click)="goTo('hero', $event)" aria-label="reals.id, về đầu trang">
      <span class="brand__mark" aria-hidden="true">R</span><span>reals.id</span>
    </a>

    <nav class="nav" id="site-nav" aria-label="Chính" [class.nav--open]="menuOpen()">
      @for (l of nav; track l.id) {
        <a [href]="'#' + l.id" (click)="goTo(l.id, $event)"
           [attr.aria-current]="activeSection() === l.id ? 'location' : null">{{ l.label }}</a>
      }
    </nav>

    <div class="account">
      @switch (authState()) {
        @case ('authed') {
          <span class="account__name">{{ displayName() }}</span>
          <button type="button" class="btn btn--ghost" (click)="logout()">Đăng xuất</button>
        }
        @case ('guest') {
          <a class="btn btn--ghost" routerLink="/auth/login">Đăng nhập</a>
          <a class="btn btn--primary" routerLink="/auth/register">Tạo tài khoản</a>
        }
        @default {
          <!-- đang kiểm tra phiên: giữ chỗ cùng kích thước để CLS ≈ 0 -->
          <span class="account__placeholder" aria-hidden="true"></span>
        }
      }
    </div>

    <button type="button" class="menu-btn" aria-controls="site-nav"
            [attr.aria-expanded]="menuOpen()" (click)="toggleMenu()">
      <span class="visually-hidden">Menu</span>
      <svg aria-hidden="true"><use href="#ic-menu" /></svg>
    </button>
  </div>
</header>

<main id="main" tabindex="-1">
  <section id="hero" data-section aria-labelledby="hero-title"> <h1 id="hero-title" data-focus-target tabindex="-1">…</h1> … Switcher … </section>
  <section id="spaces" data-section aria-labelledby="spaces-title"> … rail + @for panel (id="space-{{id}}", data-space) … </section>
  <section id="how" data-section aria-labelledby="how-title"> <ol class="steps">…</ol> @if (securityPoints.length) {…} </section>
  <section id="creator" data-section aria-labelledby="creator-title"> … </section>
  <section id="faq" data-section aria-labelledby="faq-title"> @for (f of faq; track f.q) { <details class="faq__item"><summary>{{ f.q }}</summary><p>{{ f.a }}</p></details> } </section>
  @if (!isAuthenticated()) { <section id="start" aria-labelledby="start-title"> … </section> }
</main>

<footer class="footer"> … </footer>
```

**Quy tắc markup:**

- Đúng **một** `<h1>` (hero); `<h2>` cho section; `<h3>` cho tên không gian và bước.
- Landmark duy nhất: `header`, `nav` (có `aria-label`), `main`, `footer`. `nav` của rail có `aria-label="Danh sách không gian"`.
- Mọi icon trang trí: `aria-hidden="true"` và `focusable="false"`. Nút chỉ có icon phải có nhãn (`visually-hidden` hoặc `aria-label`).
- Hình minh họa CSS của mỗi không gian: `aria-hidden="true"` (nội dung đã có bằng chữ).
- Nút chỉ dành cho hành động (`<button>`), liên kết chỉ để đi tới (`<a>`). Không dùng `<div (click)>`.
- Liên kết mở không gian: `<a [href]="space.url">` **cùng tab** theo mặc định (điều hướng trong cùng hệ sinh thái). Chỉ thêm `target="_blank" rel="noopener noreferrer"` nếu bạn chọn mở tab mới (mục 11).
- Chuỗi cố định (`Đăng nhập`, `Tạo tài khoản`, …) giữ nguyên **cùng một cách gọi** ở header, hero, CTA cuối.

### 7.5 Đặc tả `.css`

**Thứ tự layer và tổ chức file:**

```css
/* Điểm ngắt (mobile-first, media query không dùng được var()):  640px · 960px · 1200px */
@layer reset, tokens, base, layout, components, motion, a11y;
```

| Layer | Nội dung |
|---|---|
| `reset` | `box-sizing`, bỏ margin mặc định, `img, svg { display:block; max-width:100% }`, `button { font: inherit }` |
| `tokens` | Toàn bộ khối token dưới đây, đặt trong `:host` |
| `base` | Nền, màu chữ, phông, `h1-h3`, liên kết, `:focus-visible`, `scroll-margin-top` cho section |
| `layout` | `.container`, `.band*`, lưới hero, lưới spaces (rail + panel), lưới bước, footer |
| `components` | `.btn`, `.brand`, `.nav`, `.account`, `.switcher`, `.chip`, `.rail`, `.space`, `.mock`, `.steps`, `.faq__item`, `.creator`, `.footer` |
| `motion` | `@keyframes` chuỗi Switcher, chuyển tiếp hover; **bọc** trong `@media (prefers-reduced-motion: no-preference)` |
| `a11y` | `.visually-hidden`, `.skip`, `@media (forced-colors: active)` |

**Khối token (viết đầy đủ khi triển khai; giá trị đã kiểm chứng ở 3.6):**

```css
@layer tokens {
  :host {
    color-scheme: light;

    /* nguyên thủy: đúng 4 màu của theme Modern Minimalist */
    --charcoal:#36454F; --slate:#708090; --light-gray:#D3D3D3; --white:#FFFFFF;

    /* dẫn xuất từ 4 màu trên (không thêm mã hex mới) */
    --paper-2:color-mix(in srgb, var(--light-gray) 35%, var(--white));   /* ≈ #F0F0F0 */
    --paper-3:color-mix(in srgb, var(--light-gray) 55%, var(--white));   /* ≈ #E7E7E7 */
    --charcoal-hover:color-mix(in srgb, #000 12%, var(--charcoal));      /* ≈ #303D46 */

    /* ngữ nghĩa: lớp mà component dùng; .band--inverse và dark theme chỉ đảo lớp này */
    --bg:var(--white);
    --text-hi:var(--charcoal);
    --text-md:color-mix(in srgb, var(--charcoal) 82%, var(--white));     /* ≈ #5A666F */
    --line:var(--light-gray);            /* chỉ trang trí */
    --line-strong:var(--slate);          /* viền thành phần tương tác */
    --btn-hover:var(--charcoal-hover);
    --focus:var(--charcoal);

    /* chữ, khoảng cách, bo góc, bố cục */
    --font-display:"DejaVu Sans",Verdana,"Segoe UI",system-ui,sans-serif;  /* chỉ dùng weight 700 */
    --font-body:"DejaVu Sans",Verdana,"Segoe UI",system-ui,sans-serif;     /* chỉ dùng weight 400 */
    /* --fs-*, --sp-*, --r-*: theo bảng ở mục 3.4 */
    --header-h:4rem; --container:75rem; --gutter:clamp(1rem,4vw,2rem);
    --ease:cubic-bezier(.2,.7,.2,1); --dur-1:150ms; --dur-2:200ms;
  }
}

@layer layout {
  .band         { background:var(--bg); color:var(--text-hi); }
  .band--alt    { --bg:var(--paper-2); }
  .band--inverse {
    --bg:var(--charcoal); --text-hi:var(--white); --text-md:var(--light-gray);
    --line:color-mix(in srgb, var(--white) 20%, transparent);
    --line-strong:var(--light-gray);            /* Slate trên Charcoal chỉ đạt 2.44:1 */
    --btn-hover:color-mix(in srgb, var(--white) 88%, var(--charcoal));
    --focus:var(--white);
  }
}
```

**Quy ước:**

- Đặt tên phẳng theo BEM (`.space__title`, `.btn--primary`). **Không** dùng CSS nesting ở v1 để giảm rủi ro với toolchain; xem xét lại nếu Phase 0 xác nhận build xử lý tốt.
- Băng nền: `.band` (trắng), `.band--alt` (`--paper-2`), `.band--inverse` (Charcoal). Mỗi `<section>` chọn một band; component không tự viết màu.
- Nền xen kẽ và trạng thái hover dùng token dẫn xuất (`--paper-2`, `--paper-3`) pha bằng `color-mix()` từ bốn màu của theme; không thêm mã hex mới.
- Nút: `min-height: 44px`; `--primary` = nền `--text-hi` (Charcoal) + chữ `--bg` (trắng), trong `.band--inverse` hai giá trị này tự đảo; `--secondary` = viền `--line-strong` (Slate, 4.05:1) + chữ `--text-hi`; `--ghost` = không viền. Mọi trạng thái hover/active/disabled/focus có định nghĩa.
- Focus: `:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }`, không bao giờ `outline: none` mà không thay thế.
- `section { scroll-margin-top: calc(var(--header-h) + 1rem); }`.
- `position: sticky` (header, rail) yêu cầu **không có tổ tiên nào** đặt `overflow` khác `visible`; kiểm tra khung shell chứa `<router-outlet>` ở Phase 0.
- Hình minh họa (`.mock--social|video|shop|stories`) vẽ bằng vài `div` và đường kẻ 1px, chỉ dùng Charcoal/Slate/Light Gray, tối đa ~15 dòng CSS mỗi hình; thay bằng ảnh chụp thật ở Phase 5.
- `@font-face` nằm ở style toàn cục của ứng dụng (3.3); component chỉ tham chiếu `--font-display`/`--font-body`.

**Ngân sách CSS của Angular:** cấu hình mặc định của dự án mới có `budgets.anyComponentStyle` ở mức cảnh báo 2 kB / lỗi 4 kB. Một landing đầy đủ sẽ vượt xa mức này và **làm hỏng build production**. Kiểm tra `angular.json`/`project.json` và nâng ngân sách cho component này (đề xuất khởi điểm: cảnh báo 24 kB, lỗi 32 kB, chỉnh lại sau khi có số đo thật).

### 7.6 SEO, hiệu năng, bảo mật

**SEO**
- `Title` + `Meta` trong `applySeo()`: `description`, `og:title`, `og:description`, `og:type=website`, `og:image` (cần **file ảnh thật** 1200×630; placeholder CSS không dùng được cho ảnh chia sẻ, nên chưa có ảnh thì bỏ thẻ này; 11.2 D), `twitter:card=summary_large_image`. Có thể thay `setTitle` bằng thuộc tính `title` trên route.
- **Lưu ý SPA:** tag đặt lúc chạy (runtime) được công cụ tìm kiếm chạy JS đọc được, nhưng nhiều trình quét xem trước liên kết (chat, mạng xã hội) không chạy JS. Vì vậy đặt bản tĩnh của các tag Open Graph trong `index.html`, hoặc bật SSR/prerender (Phase 6) nếu trang này cần được chia sẻ nhiều.
- JSON-LD (`Organization`/`WebSite`) là tùy chọn, chỉ có ý nghĩa khi có SSR/prerender.

**Hiệu năng**
- Ảnh LCP (nếu có) dùng `priority`; phông tự host hoặc `preconnect` + `font-display: swap`; chỉ tải các trục/kiểu chữ thực sự dùng.
- Không có thư viện animation, không có ảnh nền nặng; icon là SVG nội tuyến.
- Khối giữ chỗ cho trạng thái "đang kiểm tra phiên" có kích thước cố định để CLS ≈ 0.
- Phông và asset ảnh nằm **ngoài** 3 file (`index.html`/`angular.json`/thư mục assets): đây là điều kiện tiên quyết, không phải mở rộng phạm vi.

**Bảo mật**
- URL các không gian đi qua **một** nguồn cấu hình duy nhất (đề xuất: mở rộng `window.__APP_CONFIG__` với `spaceUrls` và `portfolioUrl`, đọc qua injection token `SPACE_URLS`; chờ bạn xác nhận, 11.2 A); production chỉ chấp nhận `https:`; có một unit test fail nếu bundle production chứa `http://localhost`.
- Không nhét token vào query string khi chuyển sang ứng dụng khác.
- Chỉ nội suy `{{ }}` với dữ liệu người dùng (`displayName`); không dùng `innerHTML`.
- Nếu shell bật CSP chặt: Angular chèn `<style>` lúc chạy nên cần `ngCspNonce`; gán biến CSS bằng `[style.--i]` đi qua CSSOM nên không bị chặn.
- `logout()` hiện chỉ xóa `localStorage` của origin này và đặt `user` về `null`, nên **không** đăng xuất các không gian khác (chúng là origin riêng). Landing không được hứa điều ngược lại.

### 7.7 i18n

Toàn bộ chuỗi nằm trong khối dữ liệu ở `.ts` hoặc trong `.html` dưới dạng chuỗi ngắn, không nối chuỗi bằng code. Phase 6 nếu cần: thêm `i18n` vào template và `$localize` cho khối dữ liệu.

---

## 8. Đổ nội dung cũ vào cấu trúc mới (bước "fill", làm ở Phase 3)

Chỉ làm sau khi skeleton chuẩn (Phase 1-2) đã chạy với nội dung giữ chỗ. Nguyên tắc: tên hiển thị bằng ngôn ngữ người dùng, không bằng cách hệ thống được xây; câu chưa kiểm chứng không lên production.

### 8.1 Ánh xạ trường

| Trường ở bản cũ | Đi đâu trong bản mới | Xử lý |
|---|---|---|
| `id` | `Space.id` | Giữ (`social`, `video`, `shop`, `stories`); `portfolio` chuyển sang `CREATOR` |
| `badge` ("Social Space") | `Space.role` | Viết lại thành nhãn tiếng Việt ngắn ("Mạng xã hội") |
| `title` | `Space.name` | Giữ ("Reals Social", "Reals Video & Reels" → rút thành "Reals Video") |
| `subtitle` | `Space.summary` | Giữ ý, viết gọn 1 câu |
| `description` | `Space.description` | Giữ ý, bỏ thuật ngữ ("Live Feeds", "real-time") |
| `tagline` ("Feeds · Posts · …") | **Bỏ** | Chuỗi phân cách dấu chấm; thay bằng danh sách `features` |
| `icon` (`◎ ▶ + Aa ✦`) | `Space.icon` | Thay bằng icon trong sprite SVG |
| `themeColor`, `accentBg` | **Bỏ** | Theme Modern Minimalist không có màu điểm nhấn; không gian phân biệt bằng tên, icon, hình minh họa (3.1) |
| `clientUrl` | `Space.url` | Lấy từ `SPACE_URLS` (11.2 A); **không** giữ `localhost` |
| `buttonText` | `Space.cta` | Giữ ("Mở Reals Social", …) |
| `features` (tiếng Anh) | `Space.features` | Dịch sang ngôn ngữ người dùng (8.2) |
| `stats` | Xem 8.3 | **Không** phải thống kê người dùng; phần lớn là chi tiết kỹ thuật |
| Chip hero "Cổng Xác Thực & Điều Hướng Trung Tâm Reals IAM" | **Bỏ** | Nhãn thừa phía trên tiêu đề (mục 6) |
| `hero-desc` (SSO, 4 nền tảng, hồ sơ kiến trúc sư) | Đoạn dẫn ở hero + mục "Người xây dựng" | Tách làm hai: ý "một tài khoản cho 4 nền tảng" ở hero (bỏ chữ SSO, xem 8.3), phần hồ sơ ở `#creator` |
| Nút "Bắt đầu ngay →" (đi `/auth/login`) | Nút chính ở hero | Đổi nhãn thành **"Tạo tài khoản"** (`/auth/register`); cần bạn xác nhận (11.2 B) |
| Nút "Khám phá hệ sinh thái ↓" | Nút phụ "Xem các không gian" | Bỏ ký tự mũi tên; trỏ tới `#spaces` |
| `quick-links-grid` (5 thẻ) | **Space Switcher** | Thay bằng Switcher (4 không gian) |
| Slider + bộ đếm "x / 6" + nút Trước/Sau | **Bỏ** | Cuộn dọc |
| Khối tài khoản (`Đăng nhập`, `Tạo tài khoản`, `Đăng xuất`) | Header (`.account`) | Giữ nguyên nhãn và route |

### 8.2 Nội dung điền vào

**Điều hướng và hero**

| Vị trí | Nội dung |
|---|---|
| Nav | Bốn liên kết: Không gian, Cách hoạt động, Người xây dựng, Hỏi đáp |
| `<h1>` | Một tài khoản. Mọi không gian sáng tạo. (một màu, không nhấn nhá) |
| Đoạn dẫn | Một tài khoản reals.id cho Social, Video, Shop và Stories. |
| Nút chính / phụ (khách) | Tạo tài khoản / Xem các không gian |
| Hero (đã đăng nhập) | Chào {tên}. Nút: Chọn không gian |

**Các không gian** (thứ tự giữ như bản cũ)

```ts
const SPACES: readonly Space[] = [
  {
    id: 'social', name: 'Reals Social', role: 'Mạng xã hội', icon: 'social',
    summary: 'Chia sẻ, kết nối cộng đồng và tương tác tức thì.',
    description: 'Bảng tin trực tiếp, bài viết đa phương tiện, bình luận phân cấp theo thời gian thực, quản lý bạn bè và hồ sơ cá nhân.',
    features: ['Bảng tin trực tiếp', 'Bình luận theo luồng', 'Quản lý bạn bè', 'Hồ sơ cá nhân'],
    cta: 'Mở Reals Social', url: SPACE_URLS.social,
  },
  {
    id: 'video', name: 'Reals Video', role: 'Video và Reels', icon: 'video',
    summary: 'Video ngắn và phát trực tuyến chất lượng cao.',
    description: 'Xem video mượt, lướt reels ngắn, khám phá theo chủ đề và tạo nội dung chuyển động.',
    features: ['Phát video trực tuyến', 'Reels dọc, lướt liên tục', 'Tự điều chỉnh chất lượng theo đường truyền', 'Âm thanh cho video'],
    cta: 'Mở Reals Video', url: SPACE_URLS.video,
  },
  {
    id: 'shop', name: 'Reals Shop', role: 'Thương mại sáng tạo', icon: 'shop',
    summary: 'Mua sắm gắn liền với nội dung của nhà sáng tạo.',
    description: 'Khám phá sản phẩm độc quyền từ các nhà sáng tạo, giỏ hàng trực quan và thanh toán liền mạch.',
    features: ['Danh mục sản phẩm', 'Bộ lọc thông minh', 'Giỏ hàng', 'Thanh toán liền mạch'],
    cta: 'Mở Reals Shop', url: SPACE_URLS.shop,
  },
  {
    id: 'stories', name: 'Reals Stories', role: 'Tạp chí số', icon: 'stories',
    summary: 'Đọc và viết bài dài, tập trung, không xao nhãng.',
    description: 'Đọc và viết bài dài với chữ thanh lịch, bộ sưu tập chuyên đề và trải nghiệm đọc không phân tâm.',
    features: ['Chữ dễ đọc', 'Bộ sưu tập chuyên đề', 'Theo dõi tiến độ đọc', 'Lưu bài để đọc sau'],
    cta: 'Mở Reals Stories', url: SPACE_URLS.stories,
  },
];
```

Ghi chú khi điền: "Âm thanh cho video" (từ `Audio Tracks`) và "Bộ lọc thông minh" cần bạn xác nhận đúng nghĩa/đúng tính năng. `SPACE_URLS` là injection token đọc `window.__APP_CONFIG__.spaceUrls` (đề xuất, chờ bạn xác nhận); giá trị dev hiện tại là `4200/social`, `4201/home`, `4202/home`, `4203/home`, `4205/` (cổng 4204 không có trong file cũ).

**Cách hoạt động** (3 bước; nội dung **trung lập**, không hứa SSO vì chưa có SSO thật, mục 11.1 dòng 4). Khi SSO thật ra mắt, cập nhật bước 3 và FAQ 3.

| Bước | Tiêu đề | Nội dung |
|---|---|---|
| 1 | Tạo tài khoản một lần | Đăng ký tại reals.id. Cùng một tài khoản dùng cho mọi không gian. |
| 2 | Chọn không gian bạn muốn vào | Mở Social, Video, Shop hoặc Stories từ cùng một nơi. |
| 3 | Bắt đầu | Mỗi không gian sẽ đưa bạn vào đúng nơi. |

**Người xây dựng** (từ slide `portfolio` + các `stats` mang tính kỹ thuật)

| Trường | Nội dung |
|---|---|
| Tên | Dac Cuong |
| Vai trò | Senior Software / Backend Engineer |
| Chuyên môn | Hệ thống phân tán |
| Trường | UIT, ĐHQG-HCM |
| Giới thiệu | Bản thiết kế toàn diện về kỹ năng kỹ thuật, kinh nghiệm thiết kế hệ thống phân tán, kiến trúc vi dịch vụ và các case study triển khai quy mô lớn. |
| Công nghệ | Golang, Node, Java, Kafka, Redis, Postgres |
| Kiến trúc dự án | Shell theo kiến trúc Micro-Frontend; quản lý trạng thái bằng Signals và RxJS; phát video bằng HLS.js |
| Nút | Xem portfolio |

**Hỏi đáp** (cổng xác minh: chỉ câu `verified: true` được render)

| # | Câu hỏi | Trả lời nháp | `verified` |
|---|---|---|---|
| 1 | reals.id là gì? | Cổng tài khoản và điều hướng chung cho các không gian Social, Video, Shop và Stories. | `true` (từ mô tả cũ "Cổng Xác Thực & Điều Hướng Trung Tâm") |
| 2 | Tôi có cần tài khoản riêng cho từng không gian không? | Không. Bạn dùng cùng một tài khoản reals.id ở mọi không gian. | `true` (từ tiêu đề cũ; không nói gì về việc đăng nhập lại) |
| 3 | Đăng xuất ở đây có thoát khỏi các không gian khác không? | *Chưa có SSO thật; chờ hành vi chính thức.* | `false` (đã chốt: không hiển thị) |
| 4 | Dữ liệu của tôi được bảo vệ như thế nào? | *Cần bạn cung cấp cơ chế thật.* | `false` |
| 5 | Portfolio có cần đăng nhập để xem không? | *Cần bạn cung cấp.* | `false` |

**Bảo mật và quyền riêng tư** (khối trong `#how`): `SECURITY = []` mặc định, khối không hiển thị. Chỉ thêm điểm nào **đã triển khai thật** (ví dụ cơ chế phiên, xác thực hai bước nếu có).

**CTA cuối (khách):** "Bắt đầu với một tài khoản." / "Tạo tài khoản một lần và vào mọi không gian." / nút Tạo tài khoản, Đăng nhập.

**Footer:** logo + "reals.id"; nhóm *Không gian* (4 liên kết mở); nhóm *Trang* (Cách hoạt động, Người xây dựng, Hỏi đáp); nhóm *Tài khoản* (Đăng nhập, Tạo tài khoản / Đăng xuất); "© {năm} reals.id". Chưa có route `/terms`, `/privacy` nên **không** thêm liên kết pháp lý (đã xác nhận, 11.1).

### 8.3 Nội dung bị loại hoặc hạ cấp, và lý do

| Mục cũ | Xử lý | Lý do |
|---|---|---|
| `Micro-Frontend`, `Signals / RxJS`, `HLS.js / MediaSource` | Chuyển sang "Kiến trúc dự án" ở `#creator` | Đây là chi tiết kỹ thuật, không phải lợi ích cho người dùng cuối |
| `Độ trễ tối thiểu: < 200ms` | **Bỏ** cho tới khi có số đo | Số liệu hiệu năng chưa được kiểm chứng không nên xuất hiện công khai |
| `Cập nhật: Realtime Feed`, `Double-tap Like`, `Multi-Step`, `High Performance`, `Creator Marketplace`, `Curated Topics` | **Bỏ** khỏi `stats` | Nhãn mơ hồ hoặc lặp với `features`; "Block Editor" có thể thành tính năng thứ 5 của Stories nếu đúng thực tế |
| `Instant Checkout` | Đổi thành "Thanh toán liền mạch" | "Instant" là cam kết chưa kiểm chứng; "liền mạch" có sẵn trong mô tả cũ |
| Chip "Cổng Xác Thực & Điều Hướng Trung Tâm Reals IAM" | Bỏ | Xem mục 6 |
| Cụm "Single Sign-On (SSO)", "đăng nhập một lần" | **Bỏ** khỏi mọi câu chữ công khai | Chưa có SSO thật: mỗi ứng dụng tự giữ token trong localStorage, cụm này sẽ sai với người dùng |
| Từ "an toàn" | Chưa dùng ở hero | Chỉ dùng khi khối bảo mật có nội dung đã xác minh |
| Hiển thị URL `localhost` | Bỏ | Chi tiết dev |

---

## 9. Kế hoạch triển khai theo phase

Kích thước: **S** ≈ vài giờ, **M** ≈ nửa đến một ngày, **L** ≈ nhiều ngày. Mỗi phase có "định nghĩa hoàn thành" (DoD); chỉ sang phase sau khi đạt.

### Phase 0: Chốt quyết định và spike (S)

- [x] Đã chốt (11.1): Angular 21.2, theme Modern Minimalist, cùng tab, không có liên kết pháp lý, không SSR, copy trung lập về SSO.
- [ ] Xác nhận các điểm còn mở ở 11.2 (A, B là quan trọng nhất).
- [ ] Kiểm `app.routes.ts` (dòng 15 có `redirectTo: 'auth/register'`): landing mount ở route nào, redirect này có che landing không.
- [ ] Kiểm `app.component.ts`: host có `overflow: hidden` không (ảnh hưởng `position: sticky`).
- [ ] Kiểm thời điểm `AuthService.checkAuth()` chạy so với lần render đầu (nếu sau, giao diện khách có thể chớp một lần; khi đó giữ khối giữ chỗ cho tới khi `user()` có giá trị).
- [ ] Spike 30 phút trên một component rỗng: `templateUrl` + `styleUrl`, `@layer`, `:host { --x }`, `color-mix()` build đúng trong Angular 21.2; `[style.--i]` hoạt động; `router.navigate([], { fragment })` không xung đột với router của shell.
- [ ] Đọc `budgets.anyComponentStyle` trong `project.json` và nâng cho component này (7.5).
- [ ] Phông: tạo subset WOFF2 cho DejaVu Sans Regular + Bold (Latin, Latin-ext, Việt) từ bản DejaVu chính thức, đặt vào assets, khai báo `@font-face` ở style toàn cục, preload hai file, kèm file giấy phép (3.3).
- [ ] Nếu chọn hướng ở 11.2 A: thêm `spaceUrls` và `portfolioUrl` vào `AppConfig` (`window.__APP_CONFIG__` trong `index.html`) và tạo token `SPACE_URLS`.

**DoD:** các điểm mở được trả lời; spike xanh; chuỗi kiểm tra tiếng Việt hiển thị đúng bằng DejaVu Sans.

### Phase 1: Skeleton chuẩn, chưa có nội dung thật (M)

Mục tiêu: trang đúng cấu trúc, đúng token, chạy được ở mọi trạng thái, với **nội dung giữ chỗ**.

- [ ] Tạo 3 file; `.ts` chỉ có kiểu, signals, hàm rỗng; dữ liệu là 1-2 mục giả.
- [ ] `.css`: layer, toàn bộ token (3.2-3.4), reset, base, `.container`, `.btn`, focus, `.visually-hidden`, `.skip`.
- [ ] `.html`: skip link, header, `main` với 6 section rỗng có `id`, `aria-labelledby`, footer.
- [ ] Route trỏ tới component mới (đổi import nếu đổi tên file).

**DoD:** cuộn dọc bình thường; Tab đi qua skip link → header → section theo thứ tự hợp lý; không lỗi console; axe không lỗi cấu trúc (landmark, heading).

### Phase 2: Các section theo chuẩn (L)

Làm lần lượt, mỗi section xong là review được:

1. Header + nav + menu mobile + khối tài khoản (3 trạng thái).
2. Hero + **Space Switcher** (chưa có chuỗi mở đầu).
3. Spaces: rail, panel, hình minh họa CSS, scroll spy.
4. Cách hoạt động, Người xây dựng, Hỏi đáp (`<details>`), CTA cuối, Footer.
5. Sprite icon (nguồn icon: bộ mã nguồn mở có giấy phép cho phép, ví dụ Lucide).

**DoD:** đủ 6 section + footer với nội dung giữ chỗ; responsive ở 320 / 640 / 960 / 1280; scroll spy đúng; không cuộn ngang ở 320px.

### Phase 3: Đổ nội dung cũ (M)

- [ ] Điền dữ liệu theo mục 8.2; áp cổng `verified`.
- [ ] Chuyển `url` sang `SPACE_URLS`; xóa mọi `localhost` khỏi component.
- [ ] Rà chính tả, dấu tiếng Việt, cách gọi nhất quán (Tạo tài khoản / Đăng nhập / Mở …).

**DoD:** không còn chữ giữ chỗ; mọi câu hiển thị đều `verified`; test kiểm tra không có `http://localhost` trong dữ liệu production.

### Phase 4: Trạng thái, chuyển động, hoàn thiện (M)

- [ ] Trạng thái "đang kiểm tra phiên" (`authState() === 'checking'`) với khung giữ chỗ cố định kích thước (CLS ≈ 0).
- [ ] Chuỗi mở đầu Switcher, hover/focus, chỉ báo rail; toàn bộ bọc `prefers-reduced-motion`.
- [ ] `@media (forced-colors: active)`; kiểm tra zoom 200%.
- [ ] Trạng thái rỗng/lỗi hợp lý (ví dụ `displayName` trống → "Thành viên").

**DoD:** ma trận trạng thái (4.2) đúng ở cả ba trạng thái; bật reduced-motion thì không còn chuyển động tự chạy.

### Phase 5: SEO, hiệu năng, trợ năng, kiểm thử (M)

- [ ] `applySeo()`; tag Open Graph tĩnh trong `index.html` (bắt buộc vì không có SSR); `og:image` chỉ thêm khi đã có file ảnh thật.
- [ ] Thay favicon mặc định của Angular.
- [ ] Thay hình minh họa CSS bằng ảnh chụp thật qua `NgOptimizedImage` (nếu có asset).
- [ ] Bộ kiểm thử (mục 10); sửa hết lỗi axe mức serious/critical.
- [ ] Đo Lighthouse (mobile) và Core Web Vitals, ghi số đo vào PR.

**DoD:** đạt toàn bộ mục 10.

### Phase 6: Tùy chọn (L)

Dark theme (đảo lớp token ngữ nghĩa: nền Charcoal, chữ trắng; tính lại tương phản), màu điểm nhấn cho từng không gian (nếu bạn muốn, ngoài theme), i18n (`$localize`), SSR/prerender, chuyển khối dữ liệu sang file riêng, JSON-LD.

---

## 10. Nghiệm thu và kiểm thử

| Nhóm | Cách kiểm | Ngưỡng |
|---|---|---|
| Trợ năng | axe (tự động) + duyệt tay chỉ bằng bàn phím + 1 lần thử với trình đọc màn hình | 0 lỗi serious/critical; mọi chức năng dùng được không cần chuột; focus luôn nhìn thấy |
| Tương phản | So với bảng 3.6; kiểm các trạng thái hover/disabled; rà xem không có chỗ nào dùng Slate làm chữ thường hoặc đặt trên nền Charcoal | ≥ 4.5:1 chữ thường, ≥ 3:1 chữ lớn và viền UI |
| Phông | Chuỗi kiểm tra đủ dấu tiếng Việt ở cả Regular và Bold | Không ký tự nào rơi về phông dự phòng; đổi phông không gây nhảy layout đáng kể |
| Responsive | Playwright ở 320, 390, 768, 1024, 1440; zoom 200% | Không cuộn ngang; không chữ bị cắt/chồng dấu tiếng Việt |
| Chuyển động | Bật `prefers-reduced-motion` | Không có chuyển động tự chạy; cuộn tức thì |
| Hiệu năng | Lighthouse mobile + WebPageTest hoặc DevTools throttling | LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 (mục tiêu nội bộ: Lighthouse Performance ≥ 90, Accessibility ≥ 95) |
| Trạng thái auth | Unit test ba trạng thái (đang kiểm tra / khách / đã đăng nhập) | Header, hero, CTA cuối đúng theo ma trận 4.2 |
| Dữ liệu | Unit test: mọi `url` production dùng `https:`; `FAQ`/`SECURITY` chỉ render mục `verified` | Không có `http://localhost` trong bundle production (`grep` trên `dist`) |
| Build | `production` build + kiểm ngân sách | Không lỗi budget; kích thước CSS/JS của chunk landing được ghi lại |
| Hồi quy hành vi cũ | Đăng nhập, đăng ký, đăng xuất, mở từng không gian | Cùng route và hành vi như bản cũ |

---

## 11. Quyết định đã chốt, điểm còn mở và rủi ro

### 11.1 Đã chốt (theo phản hồi của bạn)

| # | Nội dung | Kết luận | Ảnh hưởng tới kế hoạch |
|---|---|---|---|
| 1 | Angular | ~21.2.0; `DOCUMENT` vẫn import từ `@angular/common` | Bỏ mọi phương án cho phiên bản cũ (7.2, 7.3) |
| 2 | Trạng thái auth | Không có cờ tải; `checkAuth()` tạm đặt `{ id: 'loading', email: '' }`; `logout()` đồng bộ | `authState` = `checking` / `guest` / `authed` suy ra từ `user()?.id`, **không sửa `AuthService`** (4.2, 7.3) |
| 4 | SSO | **Chưa có SSO thật.** Mỗi app là SPA riêng, token nằm trong localStorage | Bỏ mọi câu hứa "đăng nhập một lần"; "Cách hoạt động" và FAQ viết trung lập; FAQ 3-4 ẩn (4.2, 8.2, 8.3) |
| 6 | Tab | Cùng tab | 7.4 |
| 7 | Phông | Theo theme Modern Minimalist (DejaVu Sans) | Tự host subset, khai báo ở style toàn cục (3.3) |
| 8 | Pháp lý, favicon | Chưa có `/terms`, `/privacy`; favicon là mặc định Angular | Footer không có liên kết pháp lý; thay favicon ở Phase 5 |
| 9 | SSR | Không có SSR (`project.json` chỉ có target browser) | Tag Open Graph tĩnh trong `index.html` là bắt buộc; kiểm `overflow` của `app.component` ở Phase 0 |
| 10 | Theme | **Modern Minimalist** | Viết lại mục 3, 5, 6, 7.5 |

### 11.2 Còn cần bạn xác nhận

| # | Điểm | Đề xuất (đang dùng tạm cho tới khi bạn trả lời) |
|---|---|---|
| A | **Cách cấp URL không gian.** `window.__APP_CONFIG__` hiện chỉ có `apiUrl` (`index.html` dòng 21-24) | Mở rộng `AppConfig` với `spaceUrls` (bốn khóa `social`, `video`, `shop`, `stories`) **và** `portfolioUrl` (nút "Xem portfolio" ở `#creator` cũng cần URL, bản cũ dùng cổng 4205). Đọc qua injection token `SPACE_URLS` trong `@fe/core`. Nên để các khóa này **bắt buộc** thay vì `?` tùy chọn, để thiếu cấu hình thì lỗi ngay khi khởi động thay vì render nút hỏng. Giá trị dev: 4200/social, 4201/home, 4202/home, 4203/home, 4205/ |
| B | **Nút chính hero:** đổi từ `/auth/login` ("Bắt đầu ngay") sang `/auth/register` ("Tạo tài khoản")? | Đổi; đăng nhập là nút phụ ở header. Cần bạn trả lời có/không. Kèm câu hỏi: `app.routes.ts` dòng 15 có `redirectTo: 'auth/register'`, vậy landing được mount ở route nào? Nếu redirect đó áp cho đường dẫn gốc thì landing sẽ không hiển thị ở `/` |
| C | **Màu điểm nhấn cho từng không gian** | Không dùng (đúng theme). Nêu nếu muốn (3.7) |
| D | **Ảnh chia sẻ (Open Graph)** | Ảnh phải là **file PNG/JPG thật** (1200×630): trình quét xem trước liên kết chỉ đọc URL ảnh nên placeholder CSS không dùng được. Chưa có ảnh thì bỏ thẻ `og:image`; liên kết vẫn có tiêu đề và mô tả |

### 11.3 Rủi ro

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| **Câu chữ hứa SSO trong khi chưa có SSO thật** làm người dùng hiểu sai (đăng nhập ở reals.id không có nghĩa đã đăng nhập ở từng không gian, vì localStorage tách theo origin) | Cao nếu giữ câu cũ | Đã bỏ khỏi mọi copy (8.2, 8.3); cập nhật bước 3 và FAQ 3 khi SSO thật ra mắt |
| Ngân sách CSS mặc định làm hỏng build production | Cao nếu bỏ sót | Phase 0 |
| Nhấp nháy giao diện khách trước khi `checkAuth()` chạy | Trung bình | Kiểm thời điểm `checkAuth()` ở Phase 0; khối giữ chỗ cố định kích thước |
| Khung shell có tổ tiên `overflow` làm `sticky` không hoạt động | Trung bình | Kiểm `app.component.ts` ở Phase 0; dự phòng: rail không sticky |
| Redirect gốc `auth/register` che mất landing | Trung bình | Câu hỏi B; kiểm ở Phase 0 |
| DejaVu Sans rộng và chỉ có hai độ đậm: dễ nặng nề, phân cấp yếu nếu không chỉnh khoảng cách | Trung bình | Thang chữ ở 3.4, độ dài dòng 58ch, đường kẻ và khoảng trắng làm công cụ phân cấp; đánh giá bằng mắt ở Phase 2 |
| Slate Gray dùng nhầm cho chữ thường hoặc trên nền Charcoal (không đạt tương phản) | Trung bình | Quy tắc ở 3.2; kiểm tương phản ở mục 10 |
| Tag Open Graph đặt lúc chạy không hiện trong bản xem trước liên kết | Trung bình | Tag tĩnh trong `index.html` (không có SSR) |
| Nội dung cũ chứa cam kết chưa kiểm chứng đi vào production | Trung bình | Cổng `verified`, mục 8.3 |
| Subset phông thiếu ký tự tiếng Việt hiếm | Thấp | Subset đã gồm U+1EA0-1EF9; chuỗi kiểm tra ở mục 10 |
| Đổi tên file làm hỏng import của route | Thấp | Cập nhật import trong cùng commit |

---

*Hết tài liệu (v2). Bước tiếp theo đề xuất: trả lời 11.2 (A, B là quan trọng nhất), sau đó bắt đầu Phase 0.*
