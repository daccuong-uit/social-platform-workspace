Nếu mục tiêu là **portfolio cá nhân để xin việc**, đặc biệt là **Developer / Backend Engineer**, thì không nên làm kiểu “website cá nhân thật nhiều page”. Portfolio tốt phải trả lời rất nhanh 4 câu:

> **Bạn là ai → bạn giỏi gì → bạn đã làm được gì → tôi có nên liên hệ bạn không?**

Các cấu trúc portfolio hiện nay cũng thường xoay quanh **Home → Work/Projects → Case Study → About → Resume/Experience → Contact**, còn Services/Blog/Testimonials là phần tùy mục đích. ([Portfolio Studio][1])

Dưới đây là **tree chuẩn**, tôi thiết kế theo hướng **Senior Backend Developer / Software Engineer portfolio**, nhưng có thể dùng cho Developer nói chung.

---

# 1. Bức tranh tổng thể

## Cấu trúc site đề xuất

```text
PORTFOLIO
│
├── 1. HOME
│
├── 2. PROJECTS / WORK
│   │
│   ├── Project A
│   ├── Project B
│   ├── Project C
│   └── ...
│
├── 3. PROJECT DETAIL / CASE STUDY
│   └── [dynamic page cho từng project]
│
├── 4. EXPERIENCE
│
├── 5. ABOUT
│
├── 6. SKILLS
│
├── 7. RESUME
│
├── 8. CONTACT
│
├── 9. BLOG / TECHNICAL WRITING     (optional)
│
└── 10. 404
```

### Navigation chính

Tôi **không khuyến nghị** nhét cả 10 page vào navbar.

Navbar nên chỉ:

```text
[Logo / Name]

Home
Work
Experience
About

[Resume]
[Contact]
```

Còn:

```text
Skills
Blog
Project Detail
404
```

là secondary/navigation nội bộ.

Lý do rất đơn giản: portfolio là nơi recruiter/hiring manager **scan cực nhanh**, không phải một web app cần khám phá. ([Path Unbound][2])

---

# 2. Tree chi tiết từng Page

---

# PAGE 01 — HOME

```text
HOME
│
├── 1. Header / Navigation
│   ├── Logo / Name
│   ├── Home
│   ├── Work
│   ├── Experience
│   ├── About
│   ├── Resume CTA
│   └── Contact CTA
│
├── 2. Hero
│   ├── Name
│   ├── Job title
│   ├── Short positioning statement
│   ├── Short introduction
│   ├── Primary CTA: View Work
│   ├── Secondary CTA: Download Resume
│   └── Social links
│       ├── GitHub
│       ├── LinkedIn
│       └── Email
│
├── 3. Tech Stack / Core Expertise
│   ├── Backend
│   ├── Database
│   ├── Cloud
│   ├── DevOps
│   └── Other
│
├── 4. Selected Projects
│   ├── Project #1
│   │   ├── Thumbnail
│   │   ├── Project name
│   │   ├── Short description
│   │   ├── Role
│   │   ├── Tech stack
│   │   └── View Case Study
│   │
│   ├── Project #2
│   ├── Project #3
│   └── View All Projects
│
├── 5. Experience Snapshot
│   ├── Current / Latest company
│   ├── Position
│   ├── Years
│   ├── 2–3 major achievements
│   └── View Experience
│
├── 6. Engineering Highlights
│   ├── Architecture
│   ├── Scalability
│   ├── Performance
│   ├── Reliability
│   └── System Design
│
├── 7. About Snapshot
│   ├── Short bio
│   ├── Working philosophy
│   └── View About
│
├── 8. Contact CTA
│   ├── Short message
│   ├── Email
│   └── Contact button
│
└── 9. Footer
    ├── Name
    ├── Navigation
    ├── GitHub
    ├── LinkedIn
    ├── Email
    └── Copyright
```

## Home yêu cầu quan trọng nhất

### Hero

**Không viết:**

> Passionate developer who loves building amazing digital experiences.

Quá generic.

Nên viết kiểu:

> **Backend Engineer building scalable and reliable systems.**

Hoặc:

> **Senior Backend Engineer focused on scalable APIs, distributed systems and high-performance infrastructure.**

Ngay Hero phải biết:

```text
WHO
WHAT
SPECIALIZATION
CTA
```

Các hướng dẫn portfolio developer hiện tại cũng ưu tiên Hero phải nói rõ **bạn là ai + bạn build cái gì**, rồi đưa Projects lên rất sớm. ([CodeBegun][3])

---

# PAGE 02 — PROJECTS / WORK

Đây là **page quan trọng nhất sau Home**.

```text
PROJECTS
│
├── 1. Page Header
│   ├── "Selected Work"
│   ├── Short description
│   └── Project count
│
├── 2. Featured Projects
│   │
│   ├── Project Card
│   │   ├── Cover image / architecture visual
│   │   ├── Project name
│   │   ├── Problem solved
│   │   ├── Role
│   │   ├── Tech stack
│   │   ├── Impact / result
│   │   └── View Case Study
│   │
│   ├── Project Card
│   └── Project Card
│
├── 3. Other Projects
│   ├── Project card
│   ├── Project card
│   └── Project card
│
└── 4. CTA
    └── Contact Me
```

## Một Project Card nên có

```text
┌──────────────────────────────┐
│                              │
│       PROJECT IMAGE          │
│                              │
├──────────────────────────────┤
│ Shopify Data Platform        │
│                              │
│ Large-scale data ingestion   │
│ and reporting platform.      │
│                              │
│ Node.js · PostgreSQL · Redis │
│                              │
│ 2,000 shops · 100K+ records │
│                              │
│ View Case Study →            │
└──────────────────────────────┘
```

### Đừng biến Projects thành:

```text
Project A
Project B
Project C
Project D
Project E
Project F
Project G
Project H
...
```

**3–5 project mạnh** tốt hơn 10–20 project yếu. Đây cũng là pattern được khuyến nghị khá nhất quán trong portfolio hiện nay. ([Path Unbound][2])

---

# PAGE 03 — PROJECT DETAIL / CASE STUDY

Đây mới là nơi thể hiện **level Senior**.

Đối với Backend Engineer, page này cực kỳ quan trọng.

```text
PROJECT DETAIL
│
├── 1. Project Hero
│   ├── Project name
│   ├── One-line description
│   ├── Project type
│   ├── Your role
│   ├── Duration
│   ├── Team size
│   ├── Tech stack
│   └── Live / GitHub link
│
├── 2. Executive Summary
│   ├── What was the problem?
│   ├── Why did it matter?
│   ├── What did you build?
│   └── What was the result?
│
├── 3. Business Context
│   ├── Product
│   ├── Users
│   ├── Business requirement
│   └── Constraints
│
├── 4. Problem
│   ├── Existing problem
│   ├── Technical bottleneck
│   ├── Business impact
│   └── Why existing solution was insufficient
│
├── 5. Requirements
│   ├── Functional requirements
│   ├── Performance requirements
│   ├── Reliability requirements
│   ├── Security requirements
│   └── Scalability requirements
│
├── 6. Architecture
│   ├── Architecture diagram
│   ├── Services
│   ├── API
│   ├── Database
│   ├── Cache
│   ├── Queue
│   ├── External services
│   └── Data flow
│
├── 7. Technical Decisions
│   ├── Decision #1
│   │   ├── Problem
│   │   ├── Options
│   │   ├── Decision
│   │   ├── Why
│   │   └── Trade-off
│   │
│   ├── Decision #2
│   └── Decision #3
│
├── 8. Implementation
│   ├── API design
│   ├── Database design
│   ├── Business logic
│   ├── Async processing
│   ├── Caching
│   └── Error handling
│
├── 9. Performance / Scalability
│   ├── Traffic
│   ├── Data volume
│   ├── Latency
│   ├── Throughput
│   ├── Bottlenecks
│   └── Optimization
│
├── 10. Reliability
│   ├── Retry
│   ├── Idempotency
│   ├── Failure handling
│   ├── Monitoring
│   ├── Alerting
│   └── Rollback
│
├── 11. Security
│   ├── Authentication
│   ├── Authorization
│   ├── Data protection
│   └── Secrets management
│
├── 12. Result
│   ├── Before
│   ├── After
│   ├── Metrics
│   ├── Business impact
│   └── Technical impact
│
├── 13. Lessons Learned
│   ├── What worked
│   ├── What didn't
│   ├── What would you change
│   └── What you learned
│
├── 14. Links
│   ├── Live demo
│   ├── GitHub
│   └── Documentation
│
└── 15. Next Project
    ├── Previous
    └── Next
```

### Đây là công thức cực mạnh:

```text
Problem
   ↓
Constraints
   ↓
Options
   ↓
Decision
   ↓
Implementation
   ↓
Trade-offs
   ↓
Result
```

Đặc biệt với developer, **đừng chỉ show UI đẹp**. Hãy show cách bạn suy nghĩ và giải quyết vấn đề. Các case study tốt thường làm rõ problem, role, constraints, decisions và measurable outcome. ([Folioas][4])

---

# PAGE 04 — EXPERIENCE

```text
EXPERIENCE
│
├── 1. Page Header
│   ├── Experience
│   └── Short introduction
│
├── 2. Career Timeline
│   │
│   ├── Company #1
│   │   ├── Company name
│   │   ├── Position
│   │   ├── Location
│   │   ├── Period
│   │   ├── Description
│   │   ├── Responsibilities
│   │   ├── Major achievements
│   │   ├── Technologies
│   │   └── Related projects
│   │
│   ├── Company #2
│   └── Company #3
│
├── 3. Major Achievements
│   ├── Achievement #1
│   ├── Achievement #2
│   └── Achievement #3
│
├── 4. Career Progression
│   ├── Junior
│   ├── Mid
│   └── Senior
│
└── 5. Resume CTA
    └── Download Resume
```

### Achievement nên viết:

```text
Bad:
Worked on backend APIs.

Good:
Designed and optimized REST APIs handling
X requests/day, reducing p95 latency by 35%.
```

Tức là:

```text
Action
+
Technical problem
+
Scale
+
Result
```

---

# PAGE 05 — ABOUT

About **không phải autobiographical essay**.

```text
ABOUT
│
├── 1. Intro
│   ├── Photo
│   ├── Name
│   ├── Role
│   └── Short introduction
│
├── 2. Who I Am
│   ├── Background
│   ├── Current focus
│   └── Career direction
│
├── 3. How I Work
│   ├── Engineering philosophy
│   ├── Problem solving
│   ├── Collaboration
│   └── Communication
│
├── 4. What I Care About
│   ├── Reliability
│   ├── Simplicity
│   ├── Performance
│   ├── Maintainability
│   └── Developer experience
│
├── 5. Outside Engineering
│   └── Optional personal interests
│
├── 6. Social Links
│   ├── GitHub
│   ├── LinkedIn
│   └── Other
│
└── 7. CTA
    └── Let's Work Together
```

Điểm quan trọng:

> **About phải tăng trust và relevance**, không phải kể toàn bộ cuộc đời.

Các hướng dẫn UX portfolio cũng nhấn mạnh About nên trả lời bạn giải quyết loại vấn đề nào, làm việc với team ra sao và tại sao bạn phù hợp với role. ([Superhive][5])

---

# PAGE 06 — SKILLS

Với Backend Engineer, nên **group theo capability**, không phải nhét một đống logo.

```text
SKILLS
│
├── 1. Backend
│   ├── Node.js
│   ├── TypeScript
│   ├── Java
│   ├── Go
│   └── ...
│
├── 2. Frameworks
│   ├── NestJS
│   ├── Express
│   ├── Spring Boot
│   └── ...
│
├── 3. Database
│   ├── PostgreSQL
│   ├── MySQL
│   ├── MongoDB
│   └── Redis
│
├── 4. Architecture
│   ├── REST API
│   ├── Microservices
│   ├── Event-driven
│   ├── Distributed systems
│   └── System design
│
├── 5. Cloud
│   ├── AWS
│   ├── GCP
│   └── Azure
│
├── 6. DevOps
│   ├── Docker
│   ├── Kubernetes
│   ├── CI/CD
│   └── Terraform
│
├── 7. Observability
│   ├── Logging
│   ├── Metrics
│   ├── Tracing
│   └── Monitoring
│
└── 8. Engineering Practices
    ├── Testing
    ├── Code review
    ├── API design
    ├── Documentation
    └── Performance optimization
```

### Quan trọng

Đừng:

```text
⭐⭐⭐⭐⭐ Node.js
⭐⭐⭐⭐ PostgreSQL
⭐⭐⭐⭐⭐ Redis
```

Rating skill kiểu này **không có giá trị chứng minh**.

Thay vào đó:

```text
Node.js
Production experience · API · Async processing · Performance

PostgreSQL
Schema design · Query optimization · Indexing · Transactions

Redis
Caching · Distributed locking · Rate limiting
```

---

# PAGE 07 — RESUME

Resume có thể là **PDF download**, không nhất thiết phải là một page phức tạp.

Nếu làm page:

```text
RESUME
│
├── 1. Header
│   ├── Name
│   ├── Role
│   ├── Email
│   └── Location
│
├── 2. Summary
│
├── 3. Experience
│   ├── Company
│   ├── Position
│   ├── Period
│   └── Achievements
│
├── 4. Projects
│
├── 5. Skills
│
├── 6. Education
│
├── 7. Certifications
│
└── 8. Download PDF
```

**Practical:** nếu đã có CV PDF chuẩn ATS thì chỉ cần:

```text
[Download Resume PDF]
```

ở Header + Home + Contact.

---

# PAGE 08 — CONTACT

Page này phải **cực kỳ đơn giản**.

```text
CONTACT
│
├── 1. Header
│   ├── Let's Work Together
│   └── Short message
│
├── 2. Contact Information
│   ├── Email
│   ├── LinkedIn
│   └── GitHub
│
├── 3. Contact Form
│   ├── Name
│   ├── Email
│   ├── Subject
│   ├── Message
│   └── Submit
│
├── 4. Availability
│   ├── Open to work
│   ├── Freelance
│   └── Collaboration
│
└── 5. Footer
```

### Form validation

Nếu có form thật:

```text
Name
├── required
└── max length

Email
├── required
└── valid email

Message
├── required
└── max length
```

Backend phải có:

```text
rate limiting
spam protection
validation
logging
error handling
```

Không cần biến contact form thành một distributed system.

---

# PAGE 09 — BLOG / TECHNICAL WRITING

**Optional nhưng rất mạnh với Backend Engineer.**

```text
BLOG
│
├── 1. Header
│
├── 2. Featured Article
│   ├── Title
│   ├── Summary
│   ├── Category
│   ├── Date
│   └── Read article
│
├── 3. Articles
│   │
│   ├── Article Card
│   │   ├── Title
│   │   ├── Summary
│   │   ├── Category
│   │   ├── Date
│   │   └── Reading time
│   │
│   └── ...
│
└── 4. Categories
    ├── Backend
    ├── Database
    ├── Architecture
    ├── DevOps
    └── Performance
```

Article detail:

```text
ARTICLE
│
├── Title
├── Date
├── Category
├── Reading time
├── Introduction
├── Problem
├── Analysis
├── Solution
├── Code
├── Architecture diagrams
├── Trade-offs
├── Conclusion
└── Related articles
```

**Không nên làm Blog nếu bạn không định viết.**

Một page Blog trống còn tệ hơn không có Blog.

---

# PAGE 10 — 404

Nhỏ nhưng nên có.

```text
404
│
├── 404
├── Page not found
├── Short message
├── Back Home
└── View Projects
```

Không cần animation phức tạp.

---

# 3. Các component dùng xuyên suốt

Ngoài page, portfolio chuẩn nên có design system nhỏ.

```text
SHARED COMPONENTS
│
├── Header
├── Navigation
├── Mobile Navigation
├── Footer
│
├── Button
├── Link
├── Badge
├── Tag
│
├── Project Card
├── Experience Card
├── Skill Group
├── Article Card
│
├── Section Header
├── CTA Section
├── Social Links
│
├── Image / Gallery
├── Code Block
├── Architecture Diagram
│
├── Breadcrumb
└── Pagination
```

---

# 4. Responsive requirement

Portfolio hiện đại bắt buộc phải:

```text
Desktop
Tablet
Mobile
```

### Mobile

```text
Header
├── Logo
└── Hamburger

Hero
├── Name
├── Role
├── CTA

Projects
└── 1 column

Experience
└── 1 column

Contact
└── 1 column
```

Không thiết kế desktop xong rồi “co lại” cho mobile.

---

# 5. SEO requirement

Mỗi page nên có:

```text
<title>
<meta description>
canonical
Open Graph
Twitter/X metadata
favicon
semantic HTML
alt text
```

Ví dụ:

```text
Home
→ Thiếu gia — Senior Backend Engineer

Project
→ Shopify Data Platform — Backend Case Study

About
→ About Thiếu gia — Backend Engineer
```

Nếu public portfolio thì:

```text
sitemap.xml
robots.txt
structured data
```

cũng đáng có.

Một số hướng dẫn portfolio hiện tại cũng xem **page title, headings, alt text, meaningful links và indexability** là phần launch checklist, chứ không chỉ là chuyện UI. ([Lord Ai][6])

---

# 6. Performance requirement

Portfolio **không được trở thành project chứng minh bạn biết over-engineering**.

Mục tiêu:

```text
Fast initial load
Small JS
Optimized images
Lazy loading
Good Core Web Vitals
No unnecessary animation
```

Đặc biệt:

```text
Hero
↓
Projects
↓
About
```

phải render cực nhanh.

---

# 7. Accessibility

Tối thiểu:

```text
Keyboard navigation
Focus state
Semantic HTML
Accessible buttons
Accessible links
Image alt
Color contrast
Reduced motion
Form labels
Error messages
```

Đây là một trong những thứ rất dễ bị bỏ qua vì portfolio chủ yếu tập trung vào visual.

---

# 8. Nếu là Portfolio Backend Engineer — tôi sẽ chốt tree này

Không cần 10 page.

## Production version

```text
PORTFOLIO
│
├── /                         ← HOME
│
├── /work                     ← PROJECTS
│   │
│   ├── /work/project-a       ← CASE STUDY
│   ├── /work/project-b       ← CASE STUDY
│   └── /work/project-c       ← CASE STUDY
│
├── /experience               ← EXPERIENCE
│
├── /about                    ← ABOUT
│
├── /resume                   ← RESUME
│
├── /contact                  ← CONTACT
│
├── /blog                     ← OPTIONAL
│   └── /blog/article-a
│
└── /404
```

### Navbar

```text
Home
Work
Experience
About

Resume
Contact
```

### Home flow

```text
┌───────────────────────────────┐
│ HERO                          │
│                               │
│ Backend Engineer              │
│ Build scalable systems...     │
│                               │
│ [View Work] [Resume]          │
└───────────────────────────────┘
                ↓
┌───────────────────────────────┐
│ SELECTED WORK                 │
│                               │
│ Project A                     │
│ Project B                     │
│ Project C                     │
└───────────────────────────────┘
                ↓
┌───────────────────────────────┐
│ ENGINEERING EXPERTISE         │
│                               │
│ Backend / DB / Cloud / DevOps │
└───────────────────────────────┘
                ↓
┌───────────────────────────────┐
│ EXPERIENCE                    │
└───────────────────────────────┘
                ↓
┌───────────────────────────────┐
│ ABOUT                         │
└───────────────────────────────┘
                ↓
┌───────────────────────────────┐
│ CONTACT                       │
└───────────────────────────────┘
```

---

# 9. 3 phương án triển khai

## Phương án 1 — Cân bằng: **Multi-page Portfolio**

```text
Home
Work
Work/[project]
Experience
About
Contact
```

### Nên dùng khi

* Xin việc Backend/Senior
* Có 3–5 project đáng kể
* Muốn recruiter đọc case study
* Muốn portfolio tồn tại lâu dài

### Ưu điểm

* Rõ ràng
* Dễ maintain
* URL riêng cho từng project
* Có thể share trực tiếp case study
* SEO tốt hơn one-page

### Nhược

* Nhiều page hơn
* Cần routing

**→ Tôi chọn phương án này.**

---

# Phương án 2 — High-tech

```text
Next.js
+
MDX
+
Static Generation
+
Tailwind
+
Vercel
```

Tree:

```text
app/
├── page.tsx
├── work/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
├── experience/
├── about/
├── resume/
├── contact/
└── blog/
    └── [slug]/
```

Content:

```text
content/
├── projects/
├── experience/
└── articles/
```

### Nên dùng khi

Portfolio chính nó cũng muốn chứng minh:

* Next.js
* TypeScript
* SSR/SSG
* SEO
* MDX
* frontend engineering

### Không nên

Nếu mục tiêu chỉ là **xin Backend job** và bạn phải mất 2 tuần làm animation/framework.

---

# Phương án 3 — Đại trà / đơn giản

```text
React
+
Static JSON
+
Vercel
```

Ví dụ:

```text
src/
├── pages/
├── components/
├── data/
│   ├── projects.ts
│   ├── experience.ts
│   └── skills.ts
└── assets/
```

### Nên dùng

* Fresher
* Junior
* Portfolio cá nhân
* Ít content
* Muốn deploy nhanh

### Ưu điểm

**Cực dễ maintain.**

### Nhược

Case study/blog về lâu dài sẽ không đẹp bằng MDX/CMS.

---

# 10. Kết luận thực dụng

Nếu tôi thiết kế **portfolio Backend Engineer production-quality cho bạn**, tôi sẽ không làm kiểu:

```text
Home
Skills
Projects
About
Blog
Testimonials
Services
Awards
Gallery
Timeline
Lab
Playground
...
```

Quá nhiều.

Tôi sẽ làm:

```text
                    PORTFOLIO
                       │
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
      HOME            WORK          EXPERIENCE
       │               │
       │               ├── Project A
       │               ├── Project B
       │               └── Project C
       │
       ├── Expertise
       ├── Experience snapshot
       ├── About snapshot
       └── Contact
       
       ABOUT
       RESUME
       CONTACT
       
       BLOG ← optional
```

**Core = 6 page:**

```text
1. Home
2. Work
3. Project Detail
4. Experience
5. About
6. Contact
```

**Resume** có thể là PDF, **Blog** chỉ thêm khi thực sự có content.

Và với **Backend Engineer**, tôi sẽ dành công sức theo tỷ lệ gần như:

```text
40% → Case Studies
25% → Home
15% → Visual / UX
10% → Experience / About
10% → SEO / performance / accessibility
```

Chứ **không phải 70% thời gian làm animation cho Home**.

Điểm ăn tiền nhất của portfolio backend là: **người xem mở Project → nhìn thấy problem → architecture → technical decisions → trade-off → scale → result**. Đó mới là thứ biến portfolio từ “website cá nhân đẹp” thành **bằng chứng năng lực engineering**. ([Folioas][4])

[1]: https://portfoliostudio.dev/blog/portfolio-website-sections?utm_source=chatgpt.com "Portfolio Website Sections | Portfolio Studio"
[2]: https://pathunbound.com/ui-ux-design-portfolios-case-studies/?utm_source=chatgpt.com "UX Portfolio Case Study: How to Write One That Gets Hired"
[3]: https://www.codebegun.com/career/how-to-build-developer-portfolio-website?utm_source=chatgpt.com "How to Build a Developer Portfolio Website | CodeBegun"
[4]: https://folioas.com/ux-portfolio-example?utm_source=chatgpt.com "UX portfolio example (case study structure) | Folioas"
[5]: https://www.superhive.co/how-to-build-a-ux-portfolio-website-that-works?utm_source=chatgpt.com "How to build a UX portfolio website that works as hard as your best project"
[6]: https://lordai.net/2026/08/build-professional-portfolio-website-case-studies-accessibility-seo.html?utm_source=chatgpt.com "How to Build a Professional Portfolio Website: Case Studies, Accessibility, SEO, and Launch Testing - Lord Ai"