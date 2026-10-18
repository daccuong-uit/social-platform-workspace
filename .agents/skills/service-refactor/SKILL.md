---
name: service-refactor
description: "Use when refactoring or modularizing one independent backend service or frontend client while preserving its contracts and repository boundary."
---

# Service Refactor

1. Work inside one repository at a time. Read its manifest, local instructions, tests, and current callers before changing structure.
2. State one behavior hypothesis and one focused check before editing.
3. Keep changes within the owning repository. Cross-service code must use published `@daccuong-uit/*` packages or explicit HTTP/event contracts, never relative imports into another service.
4. Preserve public API, data ownership, and user identity contracts. Use expand, migrate, then contract for breaking changes.
5. Make the smallest structural change that improves ownership or removes proven duplication; do not refactor unrelated modules.
6. Run the service's documented build and focused tests immediately after the first edit. Do not delete compatibility code until consumers and rollback paths are verified.