# Workspace Agent Guide

## Repository Layout

This is a polyrepo workspace. Services, clients, `platform`, and `platform-frontend` are independent Git repositories; keep code changes inside the owning repository. The workspace root owns orchestration, infrastructure, and cross-repository documentation.

- Backend shared libraries and contracts: `platform/` (`@daccuong-uit/*`).
- Frontend shared libraries: `platform-frontend/` (`@daccuong-uit/ui`, `@daccuong-uit/frontend-core`).
- Architecture and cross-cutting plans: `docs/architecture/`.
- Domain design/reference material: `docs/domain-guides/`.
- API/data standards: `docs/specs/` and `docs/schemas/`.
- Agent workflow skills: `.agents/skills/<name>/SKILL.md`.
- Claude-specific settings/hooks: `.claude/`; installed Git hook: `.githooks/pre-push`.

See [docs/README.md](docs/README.md) for navigation and the root [README.md](README.md) for workspace commands.

## Architecture Boundaries

1. Each service owns its database and domain logic. Do not import files directly from another service repository.
2. Cross-repository contracts use versioned `@daccuong-uit/*` packages, HTTP APIs, or explicit events.
3. Keycloak is the identity provider. IAM owns application profiles keyed by Keycloak `sub`; Gateway owns the web BFF session. Browser clients use the HttpOnly session cookie and must not persist access or refresh tokens.
4. Service JWT verification and authorization remain enforced at the downstream service; never trust caller-supplied identity headers without a verified internal boundary.
5. Media Worker is Python; do not force NestJS packages or patterns into it.
6. Make schema/API/event changes backward-compatible with Expand -> Migrate -> Contract and retain rollback paths.

## Working and Validation

- Read the owner repo's `package.json`, tests, and local documentation before editing.
- Run a focused build/test after the first implementation edit, then the relevant repository checks.
- Workspace multi-repo commands are `npm run repos:status`, `npm run repos:verify`, `npm run repos:commit -- <message>`, and `npm run repos:push`.
- Never stage `.env`, credentials, build output, or dependencies. Preserve changes already present in any nested repository.
- Root `repos:verify` validates Compose configuration and checks repository diffs; it is also run by the installed pre-push hook.
