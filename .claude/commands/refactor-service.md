# Refactor Service Workflow

## Intent
Guide the agent through safely refactoring or modularizing an independent service under services/ or rontend/.

## Steps
1. **Analyze Context**: Read the service's package.json, its local dependencies, and published contracts/packages from platform/.
2. **Deterministic Checks**: Ensure static types (
pm run build or 	sc --noEmit) and tests run before introducing changes.
3. **Change Plan**: Formulate an isolated diff adhering strictly to Domain-Driven Design (DDD) boundaries.
4. **Validation**: Validate linting, compilation, and service isolation.
