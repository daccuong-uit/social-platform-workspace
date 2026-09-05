# Audit Code Workflow

## Intent
Audit code health, architectural boundaries, and security vulnerabilities across the workspace.

## Audit Checklist
- [ ] No hardcoded secrets or raw .env files committed.
- [ ] No direct circular dependencies between services/*.
- [ ] Cross-service communication goes through Gateway or published @daccuong-uit/* packages.
- [ ] All database access is encapsulated in localized service schemas.
- [ ] Strict TypeScript checks enabled across all services.
