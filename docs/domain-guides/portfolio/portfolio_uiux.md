UI/UX Plan — Landing Page Portfolio (Backend Engineer)
Theme: Modern Minimalist (grayscale, tối giản) Mục tiêu tài liệu: Đây là plan thi công UI/UX cho một trang Landing Page duy nhất, đủ chi tiết để một agent generate UI (HTML/CSS/React...) dựng trực tiếp mà không cần suy đoán thêm. Tài liệu không đề xuất sitemap hay cấu trúc nhiều trang — chỉ tập trung vào layout, spacing, typography, component, trạng thái tương tác và responsive của landing page.

1. Nguyên tắc thiết kế
Grayscale-first, không dùng màu thương hiệu sặc sỡ — mọi sự nhấn mạnh đến từ độ tương phản (contrast), khoảng trắng (whitespace) và typography, không phải màu sắc.
Content density thấp — mỗi section chỉ nói một ý, nhiều khoảng trắng, không nhồi nhét.
Scan-first layout — recruiter đọc trang trong 6–10 giây đầu, nên Hero + Selected Projects phải nằm trong viewport đầu tiên hoặc ngay sau khi cuộn 1 lần.
Không dùng animation trang trí — chỉ dùng motion có mục đích (feedback tương tác, entrance nhẹ khi scroll).
Một CTA chính duy nhất lặp lại xuyên suốt: "Xem dự án / View Work", CTA phụ: "Liên hệ / Contact" hoặc "Tải CV / Resume".
2. Design Tokens
2.1 Màu sắc (Modern Minimalist)
Token	Hex	Vai trò
--color-ink	#1F2429	Text chính, heading (đậm hơn Charcoal gốc để đạt AA trên nền trắng)
--color-charcoal	#36454F	Primary — nút CTA, icon nhấn, border active
--color-slate	#708090	Text phụ, meta text, placeholder
--color-line	#D3D3D3	Border, divider, khung card
--color-surface	#F6F6F7	Nền section xen kẽ (thay vì trắng thuần)
--color-base	#FFFFFF	Nền chính
--color-focus	#2F6FED	Chỉ dùng cho focus ring / accessibility, không dùng cho trang trí
Quy tắc phối: mỗi section chỉ dùng tối đa 2 sắc nền xen kẽ (--color-base / --color-surface) để tạo nhịp thị giác khi cuộn, không dùng gradient, không dùng shadow màu.

2.2 Typography
Font pairing (web-safe, thay thế DejaVu Sans của bản gốc để tối ưu hiển thị web):

Heading: Sora hoặc Manrope, weight 600–700
Body: Inter, weight 400–500
Mono (cho tech stack / code tag): JetBrains Mono hoặc IBM Plex Mono
Type scale (desktop → mobile):

Cấp	Desktop	Tablet	Mobile	Weight	Line-height	Letter-spacing
Display (Hero name)	56px	44px	34px	700	1.08	-0.02em
H1 (section title)	36px	30px	26px	700	1.15	-0.01em
H2 (card/sub title)	22px	20px	18px	600	1.3	0
Body L (intro/desc)	18px	17px	16px	400	1.6	0
Body	16px	16px	15px	400	1.6	0
Meta/Label	13px	13px	12px	500	1.4	0.04em (uppercase)
2.3 Spacing scale (base 4px)
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128
Padding trong component (button, badge): 8–16
Gap giữa các element trong 1 khối: 16–24
Gap giữa các section: 96 (desktop) / 64 (tablet) / 48 (mobile)
2.4 Grid & Container
Giá trị
Container max-width	1200px
Gutter desktop	32px
Gutter tablet	24px
Gutter mobile	16px
Số cột grid	12 (desktop/tablet), 4 (mobile)
Border radius	6px (button/badge), 12px (card), 100px (pill/tag)
Shadow	Chỉ 1 cấp duy nhất: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06) — dùng cho card khi hover, không dùng mặc định
2.5 Breakpoints
Tên	Range
Mobile	< 640px
Tablet	640px – 1023px
Desktop	1024px – 1439px
Large desktop	≥ 1440px (container giữ nguyên 1200px, thêm padding 2 bên)
2.6 Motion
Loại	Duration	Easing	Dùng cho
Micro (hover, focus)	150ms	ease-out	Button, link, card border
Entrance khi scroll	400ms	ease-out, translateY(12px)→0 + opacity 0→1	Section title, project card (stagger 80ms/item)
Sticky header	200ms	ease-in-out	Ẩn/hiện khi scroll xuống/lên
Tôn trọng prefers-reduced-motion: reduce — tắt toàn bộ entrance animation, giữ lại transition trạng thái (hover/focus) nhưng rút về 0ms.

3. Layout tổng thể của Landing Page
Thứ tự section theo chiều dọc (không lặp lại thông tin giữa các section):

1. Header (sticky)
2. Hero
3. Tech Stack / Core Expertise
4. Selected Projects
5. Experience Snapshot
6. Engineering Highlights
7. About Snapshot
8. Contact CTA
9. Footer
Nhịp nền xen kẽ đề xuất: Header (base) → Hero (base) → Tech Stack (surface) → Selected Projects (base) → Experience (surface) → Engineering Highlights (base) → About (surface) → Contact CTA (base, có border-top 1px --color-line) → Footer (surface).

4. Chi tiết từng Section
4.1 Header / Navigation (Sticky)
Layout

Height: 72px desktop, 64px mobile.
Container: full-width, nội dung căn giữa trong container 1200px, display: flex; justify-content: space-between; align-items: center.
Sticky top: 0, nền --color-base với backdrop-filter: blur(8px) + border-bottom 1px --color-line khi đã scroll > 8px (thêm class is-scrolled).
Ẩn khi scroll xuống > 80px, hiện lại ngay khi scroll lên (transition 200ms translateY).
Nội dung (trái → phải)

Trái: Logo/Tên (font Heading 18px, weight 700).
Giữa: Nav links Home · Work · Experience · About — Body 15px, weight 500, màu --color-slate, hover → --color-ink + underline offset 4px transition 150ms. Item active (đang ở section tương ứng khi scroll) có màu --color-ink + dot 4px bên dưới.
Phải: 2 nút — Ghost button "Resume" (border 1px --color-line, không nền) + Solid button "Contact" (nền --color-charcoal, chữ trắng).
Mobile (< 640px)

Chỉ hiện Logo + icon hamburger (24px) bên phải.
Tap hamburger → drawer full-screen từ phải sang, nền --color-base, nav links xếp dọc size 24px, 2 CTA nằm cuối drawer dạng full-width stacked. Đóng bằng icon X góc trên phải hoặc tap ra ngoài. Animation: slide-in 250ms ease-out.
Accessibility: <nav aria-label="Primary">, hamburger là <button aria-expanded>, focus trap trong drawer khi mở, đóng bằng phím Esc.

4.2 Hero
Layout desktop: Grid 12 cột, nội dung chiếm 7 cột bên trái, 5 cột bên phải để trống hoặc chứa 1 khối visual tối giản (xem "Visual phụ" bên dưới). Padding-top 128px, padding-bottom 96px (đây là section đầu tiên nên cho thở nhiều).

Nội dung & thứ tự đọc (top → bottom, trái)

Eyebrow label (Meta, uppercase, --color-slate): "Backend Engineer · Available for work" — kèm chấm tròn 6px màu xanh lá nhỏ nếu đang open-to-work (chấm màu là ngoại lệ duy nhất cho quy tắc grayscale, vì mang tính trạng thái/thông tin, không phải trang trí).
Display heading (56px, 2 dòng tối đa): "Senior Backend Engineer building scalable, reliable systems." — highlight 1 cụm từ khóa (vd "scalable, reliable systems") bằng --color-charcoal nếu phần còn lại dùng --color-slate, tạo phân cấp thị giác mà không cần thêm màu.
Sub-text (Body L, --color-slate, max-width 520px): 1–2 câu positioning statement, không viết chung chung.
CTA row (gap 16px, margin-top 32px): Nút chính "View Work →" (solid charcoal) + nút phụ "Download Resume" (ghost, icon download 16px bên trái).
Social row (margin-top 40px, gap 20px): icon GitHub / LinkedIn / Email, size 20px, màu --color-slate, hover → --color-ink + scale(1.05) 150ms. Có thể thêm divider dọc 1px trước cụm social để tách khỏi CTA.
Visual phụ (5 cột phải, ẩn trên mobile/tablet nhỏ): Không dùng ảnh chân dung to kiểu landing page thông thường (không hợp gu backend/minimalist). Thay bằng 1 trong 2 phương án:

(a) Khối "terminal card" tối giản: nền --color-ink, bo góc 12px, hiển thị vài dòng text dạng monospace mô phỏng output hệ thống (vd uptime, requests/sec) — mang tính minh họa kỹ năng, không phải ảnh thật.
(b) Để trống hoàn toàn, Hero chỉ chiếm 7/12 cột căn trái — tối giản tuyệt đối. Agent generate UI chọn 1 trong 2, mặc định dùng (b) nếu không có content/data cho (a).
Tablet (640–1023px): Hero full-width 1 cột, nội dung căn trái, Display heading giảm còn 44px, visual phụ ẩn.

Mobile (< 640px): Căn giữa toàn bộ (text-align center), Display 34px, CTA row xếp dọc full-width (button full-width, gap 12px), social row căn giữa.

4.3 Tech Stack / Core Expertise
Mục đích: Quét nhanh nhóm công nghệ, không phải liệt kê logo rời rạc.

Layout: Section header căn giữa (Label "Core Expertise" + optional 1 câu mô tả ngắn, max-width 560px, text-align center, margin-bottom 48px). Bên dưới: grid 5 cột desktop (Backend / Database / Cloud / DevOps / Other), 2 cột tablet, 1 cột mobile. Gap 24px.

Mỗi cột (component "Skill Group")

Label nhóm: H2 18px weight 600, kèm icon outline 20px phía trên (line-icon, không filled, không màu — dùng currentColor).
Danh sách công nghệ bên dưới dạng plain text list, Body 15px, --color-slate, line-height 1.8, không dùng progress bar / star rating.
Không có border/card bao quanh — dùng khoảng trắng để phân tách, giữ tinh thần minimalist (không hộp hóa mọi thứ).
Responsive: Ở mobile, mỗi nhóm cách nhau 32px, có divider ngang 1px --color-line giữa các nhóm (vì không còn grid ngang để mắt phân tách).

4.4 Selected Projects
Đây là section quan trọng nhất sau Hero — chiếm nhiều không gian thị giác nhất trang.

Section header: flex row, trái là H1 "Selected Work", phải là link text "View all projects →" (Body 15px, underline on hover) — căn baseline với H1. Margin-bottom 56px.

Layout project list: Không dùng grid card đều nhau kiểu portfolio thường thấy — dùng layout dạng hàng lớn (stacked feature rows) để mỗi project có không gian kể "problem → impact" thay vì chỉ hình + tên:

Mỗi project là 1 row, grid 12 cột: cột 1–5 là hình ảnh/thumbnail (aspect-ratio 4:3, bo góc 12px, border 1px --color-line, object-fit cover), cột 7–12 là nội dung.
Nội dung 1 project (trong khối text, căn trái, max-width 460px):
Meta label nhỏ: "01 · Data Platform" (số thứ tự + category)
H1-phụ 28px weight 700: tên project
Body 16px --color-slate, 2 dòng: mô tả problem đã giải quyết
Row tag công nghệ (component "Tag/Badge", xem mục 5.2), gap 8px, wrap
Impact line: Body 15px weight 600 --color-ink, dạng "2,000 shops · 100K+ records/day"
Link "View case study →" margin-top 20px, weight 600, underline offset animation on hover (underline "trượt" từ trái sang phải 200ms qua background-size trick)
Row thứ 2 trở đi: đảo chiều trái/phải luân phiên (project 1: ảnh trái–chữ phải, project 2: chữ trái–ảnh phải...) để tạo nhịp zig-zag, tránh đơn điệu.
Khoảng cách giữa các project row: 96px desktop.
Toàn row có hiệu ứng hover nhẹ: ảnh scale(1.02) 300ms ease-out, không đổ shadow màu.
Giới hạn nội dung: Tối đa 3 project trên landing page (featured), phần "project khác" (nếu có) hiển thị dạng list gọn (không ảnh) ngay dưới, mỗi dòng: tên · 1 dòng mô tả · tech · mũi tên — cao 64px/dòng, hover đổi nền --color-surface.

Tablet/Mobile: Row chuyển thành 1 cột, ảnh luôn nằm trên, chữ dưới, không còn zig-zag (tất cả đồng nhất ảnh-trên/chữ-dưới). Gap giữa project: 64px (tablet) / 48px (mobile).

4.5 Experience Snapshot
Mục đích: Cho thấy công ty/vai trò hiện tại + 2–3 thành tựu, không phải full timeline (timeline đầy đủ thuộc trang Experience riêng, không nằm trong scope landing page này).

Layout: 2 cột trên desktop (grid 12 → 4/8): cột trái (4 cột) là thông tin công ty, cột phải (8 cột) là danh sách achievement.

Cột trái: Logo/tên công ty (H2 20px) + Position (Body 16px --color-slate) + khoảng thời gian (Meta, 13px) + link "View full experience →".
Cột phải: 2–3 achievement, mỗi item dạng flex row: icon bullet nhỏ (4px dot, translate-y để căn baseline) + text Body 16px line-height 1.7, format theo công thức Action + technical problem + scale + result (in đậm phần con số/kết quả bằng --color-ink weight 600, phần còn lại --color-slate).
Mobile: 1 cột, cột trái lên trên, cách cột phải 24px, các achievement cách nhau 16px.

4.6 Engineering Highlights
Mục đích: Nhấn mạnh 5 trụ cột kỹ thuật (Architecture, Scalability, Performance, Reliability, System Design) — đây là section "trust signal" thuần chữ, không cần hình.

Layout: Grid 5 cột desktop, 2 cột tablet (item cuối full-width nếu lẻ), 1 cột mobile. Mỗi item không có border/card, chỉ có số thứ tự lớn mờ phía sau (Display số 48px, màu --color-line, position absolute góc trên trái, dùng như watermark trang trí tối giản) + tiêu đề (H2 18px) + 1 câu mô tả ngắn (Body 14px --color-slate).

Alternative nhẹ hơn (khuyến nghị dùng cái này nếu muốn tiết chế tối đa): bỏ số watermark, chỉ giữ icon line-art 24px + title + description — đồng bộ phong cách với section 4.3.

4.7 About Snapshot
Layout: 1 khối căn giữa, max-width 680px, text-align center, padding-top/bottom 96px.

Ảnh chân dung nhỏ, tròn, 72px, viền 1px --color-line, căn giữa phía trên (optional — có thể bỏ nếu giữ tinh thần "không ảnh mặt" xuyên suốt như Hero).
Short bio 2–3 câu, Body L 18px, line-height 1.7, --color-ink.
Link "More about me →" bên dưới, margin-top 24px.
Lưu ý UX: Đây chỉ là snapshot — không nhồi philosophy/values dài dòng vào landing page (thuộc trang About riêng, ngoài scope).

4.8 Contact CTA
Layout: Full-width band, nền --color-charcoal, chữ trắng (đây là điểm nhấn màu tối duy nhất, có chủ đích, để tạo "điểm dừng thị giác" trước Footer). Padding 96px trên dưới, nội dung căn giữa max-width 600px.

H1 32px weight 700, màu trắng: "Let's build something reliable."
Sub-text Body L, màu rgba(255,255,255,0.7).
CTA button: nền trắng, chữ --color-charcoal, hover → nền --color-surface.
Email hiển thị dạng text bên dưới CTA, có thể click-to-copy (icon copy nhỏ cạnh email, feedback "Copied" trong 1.5s khi click).
Mobile: Padding giảm còn 64px, H1 26px.

4.9 Footer
Layout: nền --color-surface, border-top 1px --color-line, padding 48px trên/32px dưới. Grid 12 cột desktop: cột 1–4 là tên + tagline ngắn, cột 5–8 là nav links rút gọn (Home/Work/Experience/About), cột 9–12 là social icons + copyright.

Mobile: 3 khối xếp dọc, căn giữa, cách nhau 24px, copyright nhỏ nhất (12px, --color-slate) nằm cuối cùng.

5. Component Spec dùng trong Landing Page
5.1 Button
Variant	Nền	Chữ	Border	Hover	Height
Primary	--color-charcoal	trắng	none	nền --color-ink, translateY(-1px)	48px desktop / 44px mobile
Ghost	transparent	--color-ink	1px --color-line	border → --color-charcoal	48px / 44px
Text link	transparent	--color-ink	none, underline on hover	màu giữ nguyên, chỉ đổi underline	auto
Padding ngang: 24px. Border-radius: 6px. Focus state (bắt buộc mọi biến thể): outline 2px --color-focus, outline-offset 2px.

5.2 Tag / Badge (tech stack trong project)
Padding: 6px 12px. Border-radius: 100px (pill). Border 1px --color-line, nền transparent, chữ 13px weight 500 --color-slate. Không hover state (không interactive).
5.3 Nav link (header)
Padding-bottom 4px, border-bottom 2px transparent → --color-ink khi active/hover, transition border-color 150ms.
5.4 Social icon link
Kích thước tap target tối thiểu 40×40px (icon 20px căn giữa) để đạt chuẩn touch target dù trên desktop, hỗ trợ accessibility tốt hơn khi zoom.
6. Bảng tổng hợp Responsive
Section	Desktop	Tablet	Mobile
Header	Full nav ngang	Full nav ngang (thu gọn gap)	Hamburger drawer
Hero	7/5 cột, visual phụ hiện	1 cột, visual ẩn	1 cột, căn giữa
Tech Stack	5 cột	2 cột	1 cột + divider
Selected Projects	Zig-zag 2 cột/row	1 cột, ảnh trên	1 cột, ảnh trên
Experience	4/8 cột	4/8 cột (thu hẹp)	1 cột
Engineering Highlights	5 cột	2 cột	1 cột
About	1 khối center 680px	giữ nguyên, giảm padding	giữ nguyên, giảm padding
Contact CTA	center 600px	giữ nguyên	giảm padding, H1 nhỏ hơn
Footer	3 khối ngang	3 khối ngang thu gọn	3 khối dọc, center
7. Accessibility Checklist (riêng landing page)
Toàn bộ heading tuân thủ thứ tự phân cấp (h1 chỉ dùng 1 lần cho Hero heading chính; các H1-phụ ở section khác thực chất nên là h2 trong DOM dù style trông giống H1).
Contrast tối thiểu AA: --color-slate (#708090) trên nền trắng đạt ~4.5:1 cho text ≥ 16px — nếu dùng cho text < 16px, đổi sang tối hơn (#5C6773) để đảm bảo AA.
Toàn bộ ảnh có alt mô tả (thumbnail project: mô tả nội dung, không phải "image1.png").
Nút icon-only (hamburger, copy email, social) đều có aria-label.
Focus visible rõ ràng trên mọi phần tử interactive (dùng --color-focus), không tắt outline mặc định mà không thay thế.
Hỗ trợ prefers-reduced-motion.
Toàn bộ button/link đạt tap target ≥ 40×40px trên mobile.
8. Performance Checklist (riêng landing page)
Hero không dùng ảnh nền nặng — nếu dùng khối "terminal card" (4.2), dựng bằng HTML/CSS thuần, không phải ảnh.
Ảnh project: nén, dùng loading="lazy" cho mọi project trừ project #1 (ưu tiên load ngay vì nằm gần viewport đầu).
Icon dùng SVG inline hoặc sprite, không dùng icon font.
Entrance animation dùng CSS transform/opacity (không animate layout property như width/height) để không gây jank.
Sticky header dùng transform: translateY() để ẩn/hiện, không animate top.
9. Ghi chú bàn giao cho Agent generate UI
Trang landing page này là 1 trang duy nhất, không cần routing — build dưới dạng 1 file HTML/CSS (hoặc 1 component) độc lập.
Toàn bộ token màu/spacing/typography ở mục 2 nên được khai báo dưới dạng CSS variables (:root) để dễ chỉnh sau này.
Nếu chưa có nội dung thật (tên project, số liệu impact, achievement...), dùng placeholder rõ ràng dạng [Tên project], [Impact metric] — không tự bịa số liệu cụ thể.
Ưu tiên build đúng thứ tự section ở mục 3, đúng spacing/breakpoint ở mục 2 và 6 trước khi tinh chỉnh animation ở mục 2.6.