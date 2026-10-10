---
name: repo-snapshot
description: >-
  Generates high-density, token-optimized architectural and code snapshots of any codebase, repository, or directory for handover to other AI models. Use whenever the user requests a snapshot of a folder/repo, needs a portable briefing for an external LLM, or wants to extract comprehensive context without inflating token counts.
---

# Repository / Folder Snapshot Generator

## Purpose
Produce a self-contained, high-density architectural snapshot of any codebase or folder. The snapshot enables external LLMs (Claude, GPT, Gemini, etc.) to immediately understand system boundaries, public contracts, conventions, known debts, and improvement areas without needing to ingest entire raw source files.

---

## Core Principles

1. **Maximum Signal-to-Noise Ratio**:
   - Extract **contracts, schemas, types, and function signatures**; strip implementation bodies, boilerplate, and repetitious syntax.
   - Never paste large files verbatim. Retain only public API boundaries, schemas, and critical business logic.
2. **Strict Boundary Scoping**:
   - Always exclude vendor/build artifacts: `node_modules`, `dist`, `build`, `.git`, `.turbo`, coverage reports, lockfiles, virtual environments, binaries, and temporary caches.
3. **Actionable Context**:
   - Always include hidden assumptions, missing configurations, structural anomalies, and a concrete backlog ready to be fed into the next model as a prompt.

---

## Execution Workflow

Follow these 4 phases when executing a snapshot:

```
[Phase 1: Discovery] ──> [Phase 2: Boundary Extraction] ──> [Phase 3: Debt & Anomaly Audit] ──> [Phase 4: Synthesis]
```

### Phase 1: Rapid Discovery & Boundary Identification
1. **Identify Git & Environment State**:
   - Retrieve current branch, latest commit hash, working tree status, and remotes.
2. **Inspect Manifests**:
   - Scan root configuration and package manifests (`package.json`, `Cargo.toml`, `go.mod`, `pom.xml`, `pyproject.toml`, `tsconfig.json`, `docker-compose.yml`, etc.).
   - Identify whether the target is a Monorepo, Polyrepo, Microservice, or Library.
3. **Map Directory Structure**:
   - Generate a tree up to depth 3–4, annotating the role of key directories rather than listing every leaf file.

### Phase 2: Interface & Contract Extraction
For each module or sub-package in the target:
1. **Exported Types & Schemas**:
   - Extract interfaces, types, DTOs, Zod/Joi schemas, OpenAPI specs, Protobuf files, or database entity definitions.
2. **Public Function / Method Signatures**:
   - Capture class definitions, constructors, exported helper functions with parameters and return types.
3. **Inter-Service / External Communication**:
   - Identify message bus topics, HTTP client endpoints, RPC definitions, and storage clients.

### Phase 3: Debt, Caveat & Anomaly Audit
Actively search for:
- Discrepancies between documentation (e.g. `README.md`) and actual code.
- Missing configuration files, missing CI/CD workflows, or uncommitted files.
- Hardcoded secrets, mock endpoints, or placeholder URLs.
- Incomplete error handling, unhandled edge cases, or fire-and-forget patterns.
- Sub-optimal dependencies or missing test suites.

### Phase 4: Snapshot Synthesis (Standard Output Template)
Format the final snapshot using the standardized schema below.

---

## Standard Snapshot Output Template

When outputting the snapshot, strictly follow this structure:

```markdown
# [Repository / Folder Name] Snapshot

> **Snapshot Metadata**
> - **Target Path**: `<absolute_or_relative_path>`
> - **Git Commit**: `<hash>` (Branch: `<branch>`, Status: `<clean/dirty>`)
> - **Remote**: `<remote_url>`
> - **Archetype**: `<Monorepo | Polyrepo Service | Shared Library SDK | Fullstack App>`
> - **Timestamp**: `<YYYY-MM-DD>`

---

## 1. Architecture & Directory Map
Provide an annotated ASCII tree explaining the purpose of each key folder:
<annotated directory tree>

---

## 2. Tech Stack & Dependencies
- **Core Languages & Runtimes**: ...
- **Key Frameworks & Libraries**: ...
- **Build / Packaging Tooling**: ...
- **Target Distribution / Deployment Target**: ...

---

## 3. Public Contracts, Types & API Signatures
Group by sub-package or core module. Use compressed syntax (types + signatures only):
<dense code blocks of interfaces, types, and schemas>

---

## 4. Configuration & Environment Schema
Document all required environment variables, default values, and validation mechanisms.

---

## 5. Architectural Patterns & Data Flow
- **Pattern Style**: (e.g., Clean Architecture, Hexagonal, CQRS, MVC, Event-Driven)
- **Data Ingress / Egress**: How data enters and leaves the system.
- **State & Caching**: Handling of persistence and state transitions.

---

## 6. Caveats, Quirks & Technical Debt (Critical Gotchas)
Bullet-point list of gotchas that a new model must know to avoid mistakes:
1. ...
2. ...

---

## 7. Handover Prompt & Improvement Backlog for Next Model
A copy-pasteable prompt template ready to be provided to Claude, GPT-4, or other models:
```text
[CONTEXT]: You are working on the <Repo Name> codebase summarized in this snapshot.
[SYSTEM GOAL]: <Brief high-level mission>
[BACKLOG]:
- [P0]: <Immediate critical task>
- [P1]: <Important architecture or feature enhancement>
- [P2]: <Quality, test, or documentation improvement>
```
```

---

## Token Optimization Rules

- **Compress Implementations**: Replace function bodies with `/* ... */` unless a specific 3-line algorithm is unique to the architecture.
- **Collapse Repetitive DTOs**: Group similar field sets into single representative examples.
- **Do Not Dump Binary or Auto-Generated Code**: Ignore `.d.ts`, `.map`, lockfiles, and minified bundles.
- **Use Markdown Tables**: Tables compress structured multi-item data significantly better than paragraphs or lists.
