Landing Page Portfolio
Skill áp dụng: marketing:draft-content (Landing Page Copy), điều chỉnh tông giọng theo yêu cầu riêng. Giữ nguyên: cấu trúc UI/UX, layout, component, class name trong .html/.css/.ts bạn đã có. Chỉ thay: phần nội dung (copy) — để đọc chuyên nghiệp, đơn giản, không nghe như do AI viết.

Nguyên tắc áp dụng khi viết lại
Tên công nghệ chỉ nằm trong tag/skill list, không nhét vào câu mô tả. Phần mô tả (Hero, Problem, Solution, Achievement...) nói về vấn đề và kết quả, không nói về công nghệ dùng để làm việc đó.
Mỗi câu tối đa 1 ý. Bỏ các câu ghép nhiều mệnh đề bằng dấu phẩy.
Mỗi phần tối đa 1 con số, và con số phải "tròn", đáng tin (tránh 99.992%, 12,450 RPS (PEAK) — nghe như bịa cho ấn tượng).
Bỏ tính từ tự khen ("xuất sắc", "tâm huyết", "chất lượng cao", "Senior" tự gắn cho mình).
Câu văn phải để người không rành kỹ thuật đọc hiểu được vấn đề và kết quả, dù không hiểu thuật ngữ.
4.1 Header
Không đổi — nav labels và button label giữ nguyên (Home / Skills / Work / Experience / Engineering / About, Resume, Contact) vì đã đủ ngắn gọn, rõ nghĩa.

4.2 Hero
Eyebrow (giữ nguyên vị trí, chỉ bớt 1 vế)

Backend Engineer
(Bỏ "· Available for work" nếu không cần thiết phải khai báo tình trạng; giữ nếu bạn thực sự đang tìm việc.)

Hero heading (bỏ tự xưng "Senior", bỏ chuỗi 3 tính từ dồn dập) — 2 phương án, chọn 1:

Phương án A (ngắn nhất): Backend Engineer.
Phương án B (có ngữ cảnh): Tôi xây dựng hệ thống backend ổn định và dễ mở rộng.
Hero lead (bỏ liệt kê 5 công nghệ/khái niệm trong 1 câu)

Tôi là Đắc Cường, kỹ sư backend tốt nghiệp Đại học Công nghệ Thông tin (UIT - ĐHQG TP.HCM).
Tôi thiết kế và xây dựng hệ thống backend cho sản phẩm có lượng người dùng lớn,
ưu tiên sự ổn định và khả năng mở rộng.
CTA buttons: giữ nguyên Xem dự án / View Work và Download Resume.

Terminal card (visual phụ): giữ nguyên cấu trúc các dòng, chỉ đổi số liệu về mức "vừa đủ tin", bỏ chữ mang tính quảng cáo (PEAK, số thập phân giả-chính-xác):

$ meshctl telemetry --live
Connecting to cluster agent...

STATUS            HEALTHY
THROUGHPUT        ~10k requests/giây
LATENCY P99       38ms
LATENCY P95       24ms
QUEUE LAG         đã đồng bộ
DB POOL           42 / 100 đang dùng
UPTIME            ổn định nhiều tháng qua

> monitoring daemon running...
4.3 Tech Stack / Core Expertise
Section heading: Kỹ năng & Công nghệ (bớt chữ so với "Kỹ năng chuyên môn & Công nghệ")

Section subtext:

Công nghệ tôi dùng để xây dựng hệ thống backend.
Danh sách công nghệ trong 5 nhóm (Backend Core, Distributed & Messaging, Databases & Caching, Cloud & DevOps, System Reliability) giữ nguyên — đây là nơi hợp lý duy nhất để liệt kê công nghệ, không cần viết lại.

4.4 Selected Projects
Bỏ đoạn diễn giải kiến trúc trong câu văn (fan-out, outbox, bloom filter...) khỏi phần đọc — các từ này chỉ nên xuất hiện trong sơ đồ/tag, không trong câu mô tả.

Project 01
Trường	Nội dung mới
title	Reals Platform
problem	Khi một người có nhiều người theo dõi đăng bài, hệ thống cần cập nhật tin tức cho rất nhiều người cùng lúc mà không bị chậm hoặc mất dữ liệu.
solution	Tôi thiết kế lại cách hệ thống phân phối bài đăng, đảm bảo dữ liệu luôn được ghi nhận đầy đủ kể cả khi có sự cố.
impact	Hệ thống xử lý ổn định với lượng truy cập lớn, không bị mất dữ liệu.
linkText	Xem chi tiết dự án →
Project 02
Trường	Nội dung mới
title	Xử lý và phát video trực tuyến
problem	Video dung lượng lớn làm chậm hệ thống chính, và việc chuyển sang nhiều độ phân giải khác nhau tốn nhiều thời gian xử lý.
solution	Tôi tách phần xử lý video ra khỏi hệ thống chính, giúp video sẵn sàng phát nhanh hơn.
impact	Video sẵn sàng phát chỉ sau vài giây tải lên.
linkText	Xem chi tiết dự án →
Project 03
Trường	Nội dung mới
title	Hệ thống đăng nhập và xác thực tập trung
problem	Người dùng cần đăng nhập một lần và dùng chung cho nhiều sản phẩm, hệ thống cũng phải nhận biết ngay khi một phiên đăng nhập bị thu hồi.
solution	Tôi xây dựng hệ thống xác thực có thể kiểm tra hợp lệ ngay lập tức, không cần truy vấn cơ sở dữ liệu mỗi lần.
impact	Xác thực gần như tức thì, dùng chung cho toàn bộ hệ thống.
linkText	Xem chi tiết dự án →
stack (tag công nghệ mỗi project): giữ nguyên như code hiện tại.

Other Projects (list gọn)
title	description
Xử lý giao dịch phân tán cho thương mại điện tử	Đảm bảo giao dịch được xử lý đúng và đầy đủ dù đi qua nhiều dịch vụ khác nhau.
Cổng kết nối thời gian thực	Duy trì hàng loạt kết nối trực tuyến cùng lúc mà không làm chậm hệ thống.
Giới hạn truy cập & bảo vệ hệ thống	Ngăn chặn lượng truy cập bất thường để bảo vệ hệ thống khỏi quá tải.
stack (text): giữ nguyên.

4.5 Experience Snapshot
Company/role/time: giữ nguyên (Reals Ecosystem & Core Platform, Senior Backend Engineer & Lead Architect, 2024 — Hiện tại).

Achievements (mỗi dòng chỉ giữ 1 con số, bỏ crộm nhiều số liệu trong 1 câu):

1. Thiết kế hệ thống xử lý sự kiện, đáp ứng ổn định với lượng truy cập lớn
   và tỉ lệ hoạt động liên tục trên 99%.

2. Tối ưu cách hệ thống lấy dữ liệu tin tức, giảm thời gian phản hồi trung bình
   xuống dưới 50ms.

3. Xây dựng hệ thống xác thực dùng chung cho toàn bộ sản phẩm, kiểm tra phiên
   đăng nhập gần như tức thì mà không cần truy vấn cơ sở dữ liệu.
4.6 Engineering Highlights
Section heading: Thế mạnh kỹ thuật (thay cho "Trụ cột kỹ thuật cốt lõi")

Section subtext:

Những nguyên tắc tôi áp dụng khi xây dựng hệ thống backend.
5 mục (bỏ hết tên pattern/thuật ngữ khỏi câu mô tả, chỉ nói kết quả):

Title	Description mới
Architecture	Chia hệ thống thành các phần nhỏ, độc lập, dễ thay đổi mà không ảnh hưởng lẫn nhau.
Scalability	Thiết kế hệ thống có thể mở rộng khi lượng người dùng tăng lên.
Performance	Tối ưu tốc độ xử lý để hệ thống phản hồi nhanh, kể cả khi tải cao.
Reliability	Xây dựng hệ thống có thể tự phục hồi khi một phần gặp sự cố, không làm gián đoạn toàn bộ dịch vụ.
System Design	Đảm bảo dữ liệu chính xác và nhất quán, kể cả khi xử lý qua nhiều dịch vụ khác nhau.
4.7 About Snapshot
Heading: Về tôi (thay cho "Đam mê chiều sâu kỹ thuật & giá trị thực tế")

Bio:

Tôi là kỹ sư backend, tốt nghiệp Đại học Công nghệ Thông tin (UIT - ĐHQG TP.HCM).
Tôi thích giải quyết các bài toán về hiệu năng, độ ổn định và khả năng mở rộng của hệ thống.
Sub-bio (có thể bỏ nếu muốn ngắn hơn, hoặc dùng câu này):

Ngoài công việc, tôi dành thời gian tìm hiểu sâu hơn về kiến trúc hệ thống.
Link: giữ nguyên Khám phá GitHub của tôi →.

4.8 Contact CTA
Title:

Bạn có một hệ thống cần xây dựng?
Description:

Nếu bạn cần một kỹ sư backend cho dự án của mình, hãy gửi email cho tôi.
Buttons/email: giữ nguyên.

4.9 Footer
Tagline:

Backend Engineer.
Tốt nghiệp UIT — ĐHQG TP.HCM.
Copyright (bỏ dòng "Built with Angular & Modern Minimalist design principles" — nghe như caption tự động sinh ra):

© 2026 Đắc Cường.
