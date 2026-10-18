---
name: workspace-organization
description: "Use when adding, moving, consolidating, or removing workspace documentation, agent skills, hooks, and repository configuration."
---

# Workspace Organization

Use one canonical home for each kind of maintained content:

| Content | Canonical location |
|---|---|
| Agent workflow skill | `.agents/skills/<skill-name>/SKILL.md` |
| Architecture and platform decisions | `docs/architecture/` |
| Domain designs and product guidance | `docs/domain-guides/<domain>/` |
| Database schemas and data contracts | `docs/schemas/` |
| API and cross-cutting technical standards | `docs/specs/` |
| Workspace overview and navigation | `docs/README.md` and root `README.md` |
| Claude-specific settings and active Claude hooks | `.claude/` |
| Installed Git hooks | `.githooks/` |
| Active GitHub Actions workflows | `.github/workflows/` |
| Workspace MCP configuration | `.mcp.json` |

## Cleanup Rules

1. Do not create a root `.architecture/` tree or a `docs/skills/` tree. Put architecture documents in `docs/architecture/`, domain guidance in `docs/domain-guides/`, and executable agent workflows in `.agents/skills/`.
2. Do not call a document a skill unless it is an on-demand agent workflow with a `SKILL.md` entry point and valid `name` and `description` frontmatter.
3. Before deleting or moving a file, search tracked source, manifests, scripts, hooks, CI workflows, and documentation for references. Update every surviving reference in the same change.
4. Keep hooks and workflows that are installed or invoked. Remove only placeholders, broken commands, obsolete workflows, or files with no supported consumer.
5. For completed implementation plans, preserve durable decisions in architecture/spec documents; remove task-only checklists after their remaining work and references are gone.
6. Do not delete build output, lockfiles, schemas, or historical domain guidance merely because it is not currently imported by application code. Confirm its owner and lifecycle first.
7. Keep `docs/README.md` as the navigation source and update it whenever a documentation path changes.