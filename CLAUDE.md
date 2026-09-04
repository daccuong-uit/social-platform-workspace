# Social Platform Workspace (Agent-Native Multi-Repo Root)

Architectural guidelines, system map, and operational guardrails for autonomous agents and engineers following Anthropic Academy standards.

## System Map & Routing
- **rontend/social-web-client/**: Modern Angular 21 micro-frontend/app-shell client for social commerce.
- **services/iam-service/**: Identity & Access Management (merged authentication & user identity services).
- **services/gateway/**: Single Entry Point API Gateway routing requests to downstream microservices.
- **services/media-service/**: Media management API (uploads, metadata, CDN handling).
- **services/media-worker/**: Asynchronous media processing background worker/queue.
- **services/social-service/**: Core social domain (posts, feeds, interactions, social graph).
- **services/shared-kernel/**: Enterprise shared packages (@platform/*) & unified infrastructure scripts.

## Knowledge Pointers
- Architecture Documentation: [docs/architecture/](docs/architecture/README.md)
- Service Specifications & API Contracts: [docs/specs/](docs/specs/README.md)
- Data Schemas & Event Blueprints: [docs/schemas/](docs/schemas/README.md)
- Agent Workflow Skills: [docs/skills/](docs/skills/README.md)

## Global Guardrails & Conventions
1. **Never edit secrets or environment files**: Never commit .env files or expose credentials.
2. **Domain Isolation**: Microservices in services/* must communicate via the API Gateway or published @platform/* packages. No relative cross-service imports (../../services/other-service).
3. **Shared Kernel Policy**: Code in services/shared-kernel/packages/ must remain generic, tested, and follow @platform/<package> namespace naming.
4. **Deterministic Validation**: Always run static types and linting (
pm run build, 	urbo run lint) before declaring a task complete.
