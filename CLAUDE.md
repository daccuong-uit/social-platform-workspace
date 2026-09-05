# Social Platform Workspace — Claude Directive (`CLAUDE.md`)
> Agent-Native Multi-Repo Root Directives & Operational Standards following Anthropic Claude Guidelines.

---

## 1. System Map & Workspace Architecture

This workspace is a high-performance Polyrepo/Monorepo architecture hosting social commerce backend microservices and modern frontend applications:

### Microservices Directory: `services/`
- **`services/gateway/`** (`@app/gateway`):
  - Fastify + NestJS API Gateway with Throttler rate limiting.
  - Entry point for all client requests, routes to downstream microservices.
- **`services/iam-service/auth-service/`** (`@app/auth-service`):
  - Authentication, JWT issuance, refresh tokens, password hashing, and role-based policies.
  - Prisma ORM (`services/iam-service/auth-service/prisma/schema.prisma`).
- **`services/iam-service/identity-service/`** (`@app/identity-service`):
  - User profiles, account identities, user metadata, and credential federation.
  - Prisma ORM (`services/iam-service/identity-service/prisma/schema.prisma`).
- **`services/social-service/`** (`@app/social-service`):
  - Core social domain: Posts, Comments, Likes, User social graphs, and feed streams.
  - Structured modular layered architecture (Controllers -> Services -> Repositories -> Event Listeners).
  - Prisma ORM (`services/social-service/prisma/schema.prisma`).
- **`services/media-service/`** (`@app/media-service`):
  - Media upload management, metadata indexing, signed URLs, and BullMQ dispatching.
- **`services/media-worker/`**:
  - Background asynchronous BullMQ media processor (transcoding, compression, thumbnails).
- **`services/shared-kernel/`**:
  - Reusable platform libraries under `@platform/*` namespace (`@platform/common`, `@platform/config`, `@platform/logger`, `@platform/redis`, `@platform/tracing`, `@platform/auth-sdk`).
  - Unified local infrastructure (`services/shared-kernel/infra/docker/docker-compose.yaml`).

### Frontend Directory: `frontend/`
- **`frontend/social-web-client/`**: Modern client for social commerce.

---

## 2. Deterministic Command Reference

All commands MUST be executed from workspace root or targeted using Turborepo / npm workspaces. Do not guess commands.

### Monorepo-Wide Commands
```bash
# Start all infrastructure (PostgreSQL, Redis, RabbitMQ)
npm run infra:up

# Stop infrastructure
npm run infra:down

# Build all packages & services
npm run build
# Or target via turbo:
npx turbo run build

# Lint all packages & services
npm run lint
# Or target via turbo:
npx turbo run lint

# Run all unit tests
npm run test
# Or target via turbo:
npx turbo run test
```

### Individual Service Commands
To run commands for a specific service, use `npm --workspace` or `turbo --filter`:

```bash
# Gateway
npm --workspace=@app/gateway run dev
npm --workspace=@app/gateway run build
npm --workspace=@app/gateway run test

# Auth Service
npm --workspace=@app/auth-service run dev
npm --workspace=@app/auth-service run build
npm --workspace=@app/auth-service run test
npm --workspace=@app/auth-service run db:generate
npm --workspace=@app/auth-service run db:migrate

# Identity Service
npm --workspace=@app/identity-service run dev
npm --workspace=@app/identity-service run build
npm --workspace=@app/identity-service run test
npm --workspace=@app/identity-service run db:generate
npm --workspace=@app/identity-service run db:migrate

# Social Service
npm --workspace=@app/social-service run dev
npm --workspace=@app/social-service run build
npm --workspace=@app/social-service run test
npm --workspace=@app/social-service run db:generate
npm --workspace=@app/social-service run db:migrate

# Media Service
npm --workspace=@app/media-service run dev
npm --workspace=@app/media-service run build
npm --workspace=@app/media-service run test
npm --workspace=@app/media-service run db:generate
npm --workspace=@app/media-service run db:migrate
```

---

## 3. Code Style & Architecture Guidelines

### A. Layered Modular Architecture (Phase 3 Spec)
All NestJS services must follow clean module separation:
1. **Controllers (`*.controller.ts`)**:
   - HTTP route handlers only.
   - Inject Services; never directly query Database/Prisma in Controllers.
   - Use DTOs with validation decorators (`class-validator` or `zod`).
2. **Services (`*.service.ts`)**:
   - Domain business logic, transaction boundaries, and orchestration.
   - Delegate data persistence to dedicated Repositories where applicable.
3. **Repositories (`*.repository.ts`)**:
   - Encapsulate Prisma queries, data transformations, and caching logic.
4. **Listeners / Consumers (`*.listener.ts` / `*.consumer.ts`)**:
   - Handle asynchronous events and messages decoupled from HTTP request cycles.

### B. Naming & TypeScript Conventions
- **Files**: Kebab-case with type suffix: `user-profile.service.ts`, `create-post.dto.ts`, `post.entity.ts`.
- **Classes**: PascalCase: `UserProfileService`, `CreatePostDto`.
- **Variables & Methods**: camelCase: `findPostById`, `currentUser`.
- **Interfaces & Types**: PascalCase, descriptive names without `I` prefix: `PostPayload`, `AuthTokenClaims`.
- **Strict Typing**: Never use `any` when a type can be inferred or defined.

### C. Import Rules & Boundary Guardrails
1. **Domain Isolation**: Microservices in `services/*` must NEVER import relative paths from other microservices (`../../services/other-service`). This is strictly enforced by PreToolUse deterministic hooks.
2. **Shared Packages**: Cross-service code must be shared exclusively via `@platform/*` packages in `services/shared-kernel/packages/`.
3. **No Secret Commits**: Never edit or commit `.env` or credential files.
4. **Fastify Compatibility**: Services use `@nestjs/platform-fastify`. Do not use Express-specific request/response idioms unless explicitly configured.

---

## 4. Claude Agent Environment Integration

This workspace is equipped with **Claude Code Deterministic Hooks** located in `.claude/`:
- **`settings.json`**: Official Anthropic schema hook registrations.
- **`hooks/pre-command/`**: Guards blocking destructive commands (`rm -rf`, `prisma reset`, `git push --force`).
- **`hooks/validators/`**: Enforces microservice domain isolation during file edits.
- **`hooks/post-command/`**: Provides automated quality and layer consistency feedback.
- **`hooks/event-handlers/`**: Session lifecycle management (`SessionStart`, `Stop`).
