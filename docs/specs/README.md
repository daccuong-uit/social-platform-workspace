# Static Knowledge: Specifications & API Conventions

Tài liệu quy chuẩn kỹ thuật (Technical Specifications), tiêu chuẩn thiết kế API (RESTful API Standards), cấu trúc phản hồi chuẩn (Response Envelope) và quy ước bảo mật trong toàn bộ hệ sinh thái **Reals Platform**.

---

## 1. Chuẩn Hóa Cấu Trúc Phản Hồi (Single Envelope Standard)

Tất cả các API công khai đi qua API Gateway (`services/gateway`) hoặc nội bộ giữa các microservice đều phải tuân theo cấu trúc phản hồi chuẩn (Single Envelope) do thư viện `@daccuong-uit/platform-http-common` cung cấp:

### Phản Hồi Thành Công (Success Envelope)
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "items": [...],
    "total": 100
  },
  "meta": {
    "timestamp": "2026-09-19T10:00:00.000Z",
    "requestId": "req-uuid-12345"
  }
}
```

### Phản Hồi Lỗi (Error Envelope)
```json
{
  "statusCode": 404,
  "message": "Novel not found",
  "error": "NOT_FOUND",
  "meta": {
    "timestamp": "2026-09-19T10:00:00.000Z",
    "requestId": "req-uuid-12345"
  }
}
```

> [!IMPORTANT]
> **Quy tắc Single Envelope:** API Gateway đã tích hợp interceptor tự động normalize response từ upstream services. Các microservices backend cần trả về dữ liệu thuần túy (hoặc thông qua chuẩn `platform-http-common`), tránh hiện tượng wrap lặp 2 lần (`data.data`).

---

## 2. Quy Chuẩn Phân Trang (Pagination Convention)

Mọi endpoint danh sách hỗ trợ phân trang đều sử dụng 2 tham số query chuẩn:
- `page` (number, default: `1`, min: `1`)
- `limit` (number, default: `20`, max: `100`)

Dữ liệu trả về phân trang chuẩn:
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 3. Xác Thực & Ủy Quyền (Authentication & Security)

- **Cơ chế Token:** Sử dụng JWT Bearer Token trong header `Authorization: Bearer <jwt_access_token>`.
- **Phân tách Trách nhiệm:**
  - **API Gateway**: Xác thực token sơ bộ (`JwtAuthGuard`), giải mã `userId`, `role` và inject vào request headers (`x-user-id`, `x-user-role`) trước khi forward vào các microservices nội bộ.
  - **Microservices**: Có thể tiếp nhận danh tính người dùng thông qua custom decorators (`@CurrentUser()`, `@OptionalUser()`) hoặc verify token cục bộ khi cần.
- **RBAC Roles:** `USER`, `AUTHOR`, `CREATOR`, `MODERATOR`, `ADMIN`, `SYSTEM_ADMIN`.

---

## 4. OpenAPI / Swagger Documentation

Mỗi microservice khi chạy ở chế độ phát triển đều cung cấp giao diện Swagger UI tự động:

| Service | Swagger URL Local |
|---|---|
| **API Gateway** | `http://localhost:3000/docs` |
| **IAM Service** | `http://localhost:3001/docs` |
| **Media Service** | `http://localhost:3003/docs` |
| **Social Service** | `http://localhost:3004/docs` |
| **Stories Service** | `http://localhost:3005/docs` |
