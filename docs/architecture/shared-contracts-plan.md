# 03. Kế hoạch Shared Contracts & Protocols (Cross-Platform FE & BE)

> **Phạm vi tài liệu:** Kế hoạch xây dựng gói thư viện hợp đồng dùng chung (**`@daccuong-uit/contracts`** hoặc repo `platform-contracts`).  
> **Nguyên tắc:** **Zero Runtime Dependencies** — Là "nguồn sự thật duy nhất" (Single Source of Truth) kết nối giữa toàn bộ Backend (NestJS microservices) và Frontend (6 Angular clients), đảm bảo tương thích tuyệt đối về kiểu dữ liệu, xác thực form, mã lỗi, và cấu trúc sự kiện.
> **Tuân thủ định hướng kiến trúc (`target-architecture-plan.md`):**
> - Phân định rõ `UserId` (UUID chuẩn từ Keycloak `sub`) và `EntityId` (21 ký tự K-Sortable cho dữ liệu nghiệp vụ).
> - Chuẩn hóa Hợp đồng Phiên (Session Contract) giữa Gateway BFF và Frontend clients.

---

## 1. Vị trí & Vai trò trong Kiến trúc Tổng thể

```
┌────────────────────────────────────────────────────────────────────────┐
│             @daccuong-uit/contracts (Pure TypeScript + Zod)            │
│   - Không phụ thuộc Node.js (không fs, crypto, child_process)          │
│   - Không phụ thuộc NestJS hay Angular                                 │
│   - Đóng gói: TypeScript ESM/CJS, JSON Schema, Error Code Catalog       │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
         Import trực tiếp                   Import trực tiếp
                    ▼                                ▼
┌───────────────────────────────────────┐ ┌──────────────────────────────┐
│       Backend (NestJS Services)       │ │  Frontend (6 Angular Clients)│
│  - DTO validation (@Body, @Query)     │ │  - Form validation (Zod)     │
│  - AppException mã lỗi                │ │  - Typed API responses       │
│  - Database entity IDs & Keycloak sub │ │  - RFC 9457 form error binds │
│  - CloudEvents & Outbox publishing    │ │  - BFF Session state checks  │
└───────────────────────────────────────┘ └──────────────────────────────┘
```

---

## 2. Các Hợp đồng Cốt lõi (Core Contracts)

### 2.1. Chuẩn Định danh: `UserId` (Keycloak) vs `EntityId` (Nghiệp vụ)
Quy chuẩn rõ ràng để tránh nhầm lẫn:
- **`UserId` (Keycloak `sub`):** Chuẩn UUID v4 đại diện cho người dùng trên toàn hệ thống.
  ```typescript
  export const UserIdSchema = z.string().uuid('UserId must be a valid Keycloak UUID sub');
  export type UserId = z.infer<typeof UserIdSchema>;
  ```
- **`EntityId` (Dữ liệu Nghiệp vụ):** Chuỗi 21 ký tự base62 (13 số epoch timestamp mili giây + 8 ký tự ngẫu nhiên), tối ưu hóa index B-Tree cho bài viết, bình luận, đơn hàng:
  ```typescript
  export const EntityIdRegex = /^\d{13}[A-Z0-9]{8}$/;
  
  export const EntityIdSchema = z
    .string()
    .length(21, 'EntityId must be exactly 21 characters')
    .regex(EntityIdRegex, 'Invalid EntityId format');
  
  export type EntityId = z.infer<typeof EntityIdSchema>;
  ```

### 2.2. Hợp đồng Phiên Gateway BFF (Session Contract)
Hợp đồng dữ liệu trả về từ Gateway BFF endpoint `GET /api/auth/session` cho Frontend:
```typescript
export const UserPrincipalSchema = z.object({
  sub: UserIdSchema,
  email: z.string().email(),
  username: z.string(),
  name: z.string().optional(),
  roles: z.array(z.string()).default([]),
});
export type UserPrincipal = z.infer<typeof UserPrincipalSchema>;

export const SessionResponseSchema = z.object({
  isAuthenticated: z.boolean(),
  user: UserPrincipalSchema.nullable(),
});
export type SessionResponse = z.infer<typeof SessionResponseSchema>;
```

### 2.3. Hợp đồng Lỗi HTTP (RFC 9457 Problem Details)
Cả Backend và Frontend cùng chia sẻ cấu trúc lỗi chuẩn:

```typescript
export interface ValidationErrorItem {
  field: string;
  message: string;
  code: string;
}

export interface ProblemDetails {
  type: string;             // URI trỏ đến tài liệu lỗi
  title: string;            // Tiêu đề ngắn gọn
  status: number;           // HTTP status code (400, 401, 403, 404, 409, 500)
  code: string;             // Mã lỗi ổn định trong từ điển
  detail: string;           // Diễn giải chi tiết
  instance: string;         // Đường dẫn request (URL path)
  errors?: ValidationErrorItem[]; // Lỗi chi tiết từng trường form
  traceId?: string;         // Khóa liên kết OpenTelemetry
  timestamp: string;        // Thời điểm xảy ra lỗi (ISO 8601 UTC)
}
```

#### Từ điển Mã lỗi Ổn định (Stable Error Codes Catalog):
```typescript
export const ErrorCodes = {
  // Common / System (500, 503)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Validation (400)
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_PAYLOAD: 'INVALID_PAYLOAD',
  
  // Authentication & Session BFF (401, 403)
  AUTH_UNAUTHENTICATED: 'AUTH_UNAUTHENTICATED',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  
  // Database / Resource (404, 409)
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DB_DUPLICATE_KEY: 'DB_DUPLICATE_KEY',
  DB_FOREIGN_KEY_VIOLATION: 'DB_FOREIGN_KEY_VIOLATION',
  DB_TRANSACTION_CONFLICT: 'DB_TRANSACTION_CONFLICT',
  DB_DEADLOCK: 'DB_DEADLOCK',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
```

### 2.4. Hợp đồng Phân trang & Tìm kiếm (Pagination & Filtering)
```typescript
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),       // VD: "-createdAt,name"
  search: z.string().optional(),     // Chuỗi tìm kiếm
});

export const PaginationMetaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export interface PaginatedResponse<T> {
  data: T[];
  meta: z.infer<typeof PaginationMetaSchema>;
}
```

### 2.5. Hợp đồng Thao tác Hàng loạt (Bulk Operations)
```typescript
export const BulkDeleteRequestSchema = z.object({
  ids: z.array(EntityIdSchema).min(1).max(100),
});

export const BulkDeleteResponseSchema = z.object({
  requested: z.number().int(),
  deleted: z.number().int(),
  notFound: z.array(z.string()),
});
```

### 2.6. Hợp đồng Sự kiện (CloudEvents 1.0 Envelope)
```typescript
export interface CloudEvent<TData = unknown> {
  specversion: '1.0';
  id: string;               // UUID v4
  source: string;           // Tên microservice phát sinh (VD: "/services/iam-service")
  type: string;             // Loại sự kiện (VD: "com.socialplatform.user.created.v1")
  time: string;             // UTC ISO 8601
  datacontenttype: 'application/json';
  traceparent?: string;     // W3C Trace Context
  data: TData;
}
```

---

## 3. Cấu trúc Thư mục Package

```
contracts/
├── src/
│   ├── ids/                  # UserId (UUID) & EntityId schemas
│   ├── auth/                 # UserPrincipal & SessionResponse schemas
│   ├── errors/               # RFC 9457 ProblemDetails schema, ErrorCodes dictionary
│   ├── pagination/           # PaginationQuery, PaginationMeta, PaginatedResponse
│   ├── bulk/                 # BulkDelete request & response schemas
│   ├── events/               # CloudEvents envelope & Domain event payloads
│   ├── domains/              # Enums dùng chung (UserRole, PostType, MediaStatus,...)
│   └── index.ts
├── dist/
│   ├── index.js              # ESM build
│   ├── index.d.ts            # TypeScript definitions
│   ├── json-schema/          # JSON Schema sinh tự động (z.toJSONSchema)
│   └── error-codes.json      # Danh mục mã lỗi JSON cho Frontend
├── package.json
└── tsconfig.json
```

---

## 4. Lộ trình Thi công Contracts

1. **Khởi tạo Package `@daccuong-uit/contracts`:** Cấu hình TypeScript, Zod, Vitest.
2. **Đóng gói Core Schemas:** `UserId`, `EntityId`, `UserPrincipal`, `SessionResponse`, `ProblemDetails`, `ErrorCodes`, `Pagination`.
3. **Đóng gói Domain Types:** Các domain events chuẩn (CloudEvents 1.0).
4. **Build Pipeline:** Tự động sinh `dist/json-schema` và `dist/error-codes.json`.
5. **Tích hợp:** Cung cấp cho cả `platform-backend` và `platform-frontend` import trực tiếp.
