# Static Knowledge: Agent Skills & Domain Recipes

Tập hợp tài liệu hướng dẫn nghiệp vụ chuyên sâu, đặc tả thiết kế phân hệ (Domain Specs) và recipe kỹ thuật dành cho lập trình viên và autonomous AI agents khi triển khai hoặc mở rộng các tính năng trong hệ sinh thái **Reals Platform**.

---

## 1. Bản đồ Thư mục Skills

```
docs/skills/
├── auth/                               # Phân hệ Authentication, SSO & IAM Client Landing
│   ├── landing-page.md                 # UI/UX, Design Tokens, Copywriting & Section Specs cho IAM Landing
│   └── target-architecture-plan.md     # Kế hoạch kiến trúc mục tiêu cho IAM Service & Web SSO
├── portfolio/                          # Trang Portfolio cá nhân (frontend/portfolio-web-client)
│   ├── portfolio_content.md            # Nội dung chi tiết, kinh nghiệm làm việc, profile
│   └── portfolio_uiux.md               # Thiết kế UI/UX, phong cách tối giản, animations & wireframes
└── stories/                            # Phân hệ Novel Reading Platform (services/stories-service & stories-web-client)
    ├── reading-service-design.md       # Thiết kế chi tiết 20 modules backend, luồng đọc, thư viện, ví tiền & kiếm tiền
    └── schema.prisma                   # Chuẩn Prisma schema (55 models) quản lý toàn bộ cơ sở dữ liệu stories_db
```

---

## 2. Chi tiết từng Nhóm Kỹ năng (Domain Skills)

### 📚 Stories & Novel Reading (`docs/skills/stories/`)
- **[Reading Service Design](./stories/reading-service-design.md)**:
  - Bản thiết kế đầy đủ backend cho nền tảng đọc truyện chữ/tiểu thuyết trực tuyến (Reals Novel Platform).
  - Bao gồm 20 modules nghiệp vụ: Novels, Chapters, Reading Progress, Library, Reviews, Comments, Reactions, Discovery, Announcements, Authors, Earnings, Moderation, Analytics, Search, Users, Follow, Notifications, Wallet, Events.
  - Cơ chế cache lượt xem bất đồng bộ qua Redis, Transaction outbox pattern và Event Bus.
- **[Schema Prisma Blueprint](./stories/schema.prisma)**:
  - 55 models quan hệ toàn diện cho Stories Service, mapping với PostgreSQL schema.
  - Sử dụng generator độc lập `@prisma/client-reading`.

### 🔐 Authentication & Identity (`docs/skills/auth/`)
- **[IAM Landing Page Specification](./auth/landing-page.md)**:
  - Quy chuẩn màu sắc, font chữ, layout responsive, components và micro-interactions cho trang đích giới thiệu hệ sinh thái Reals SSO.
- **[Target Architecture Plan](./auth/target-architecture-plan.md)**:
  - Lộ trình cải tiến IAM Service: Multi-Factor Authentication (Email/SMS OTP), Session Rotation, RBAC, Redis Blacklist Token và Event Tracing.

### 💼 Portfolio Showcase (`docs/skills/portfolio/`)
- **[Portfolio Content](./portfolio/portfolio_content.md)**:
  - Đặc tả profile, dự án tiêu biểu, timeline sự nghiệp và tech stack.
- **[Portfolio UI/UX](./portfolio/portfolio_uiux.md)**:
  - Hướng dẫn thiết kế giao diện tối giản hiện đại, interactive showcase, glassmorphism và responsive design.

---

## 3. Hướng dẫn dành cho AI Coding Agents

Khi được giao nhiệm vụ liên quan đến một domain:
1. **Đọc tài liệu thiết kế tương ứng trong `docs/skills/<domain>/` trước** khi viết code mới.
2. Tuân thủ nghiêm ngặt mô hình cơ sở dữ liệu đã chuẩn hóa (ví dụ: `schema.prisma`).
3. Đảm bảo tuân thủ các nguyên tắc kiến trúc chung tại [Architecture Baseline](../architecture/README.md).
