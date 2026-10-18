# Domain Guides

Thư mục này chứa thiết kế nghiệp vụ và hướng dẫn sản phẩm. Agent workflow skills nằm riêng trong `.agents/skills/` và phải có `SKILL.md` cùng frontmatter.

## Stories

- [Reading service design](./stories/reading-service-design.md): modules, luồng đọc, thư viện, ví tiền và doanh thu.
- [Stories Prisma blueprint](./stories/schema.prisma): bản thiết kế tham khảo, chưa đồng bộ với schema live tại `services/stories-service/prisma/schema.prisma`; không dùng làm migration source.

## Portfolio

- [Portfolio UI/UX](./portfolio/portfolio_uiux.md): layout, tokens và trạng thái giao diện.
- [Portfolio content](./portfolio/portfolio_content.md): nội dung profile, dự án và kinh nghiệm.

SSO và platform architecture được quản lý trong [docs/architecture](../architecture/README.md), không đặt trong domain guides.