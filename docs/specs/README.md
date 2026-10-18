# Static Knowledge: Specifications & API Conventions

Cross-cutting API and security conventions for **Reals Platform**. Prefer the shared contracts package for runtime schemas; preserve existing API shapes until each consumer has migrated.

---

## 1. Chuẩn Hóa Cấu Trúc Phản Hồi (Single Envelope Standard)

New APIs should use the shared `ProblemDetails` contract (RFC 9457) from `@daccuong-uit/contracts`. Existing endpoints may still return the legacy success envelope from `@daccuong-uit/platform-http-common`; do not change those response shapes without migrating their clients.

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

> **Migration rule:** Do not add a second envelope around an upstream response. Migrate legacy endpoints and clients incrementally, with contract tests before removing the old shape.

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

- **Browser authentication:** Web clients use the Gateway BFF with an HttpOnly session cookie. Access and refresh tokens stay server-side and must not be stored in browser storage or exposed to JavaScript.
- **Service authentication:** Each downstream service independently verifies the Keycloak access JWT with `@daccuong-uit/backend-auth` and configured issuer/audience/JWKS.
- **Phân tách Trách nhiệm:**
  - **Gateway**: Owns OIDC login/callback, BFF session, refresh, logout and downstream token forwarding.
  - **Microservices**: Verify the forwarded Keycloak JWT locally. Do not trust identity headers as the sole authentication proof.
- **RBAC Roles:** `USER`, `AUTHOR`, `CREATOR`, `MODERATOR`, `ADMIN`, `SYSTEM_ADMIN`.

---

## 4. OpenAPI / Swagger Documentation

Mỗi microservice khi chạy ở chế độ phát triển đều cung cấp giao diện Swagger UI tự động:

| Service | Swagger URL Local |
|---|---|
| **API Gateway** | `http://localhost:3000/docs` |
| **IAM Service** | `http://localhost:3001/docs` |
| **Media Service** | `http://localhost:3003/docs` |
| **Social Service** | `http://localhost:3002/docs` |
| **Stories Service** | `http://localhost:3004/docs` |
