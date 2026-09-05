# Social Platform Agent Workspace

This repository is the Agent wrapper for a polyrepo system. It contains Agent instructions, `.claude` workflows, documentation, and the local Docker Compose orchestration. Application source code belongs to the independent repositories under `services/`, `platform/`, and `frontend/`.

## What runs where

```text
Browser -> frontend:4200 -> gateway:3000
                              |-> iam-service:3001 -> iam_db
                              |-> media-service:3003 -> media_db
                              |-> social-service:3004 -> social_db
media-worker -> Redis + MinIO
```

IAM, Media, and Social have separate PostgreSQL containers, volumes, schemas, and migrations. The services share infrastructure such as Redis, MinIO, and Jaeger, but never share ownership of a database.

## Start the complete stack

From this directory:

```powershell
Copy-Item .env.example .env
# Set NODE_AUTH_TOKEN in the current shell for private platform packages.
$env:NODE_AUTH_TOKEN = "<GitHub Packages token>"
docker compose build
docker compose up -d
docker compose ps
```

Open `http://localhost:4200`. Gateway health is `http://localhost:3000/api/v1/health`.

Stop the stack:

```powershell
docker compose down
```

Volumes are preserved by `down`; use `docker compose down -v` only when you intentionally want to delete local database data.

## How changes are deployed

Each service has its own Git repository and CI workflow. A normal `git push` runs tests/builds and publishes an image; it does not change a running container. To update local Docker:

```powershell
git pull
docker compose build <service>
docker compose up -d <service>
```

For production, push the image tag to the deployment system. Docker Compose recreates the service; Kubernetes performs a rolling update after the Deployment image tag changes.

## Repositories

- `services/gateway`: API gateway and request routing.
- `services/iam-service`: unified identity and access management.
- `services/media-service`: media metadata and storage records.
- `services/media-worker`: background media processing.
- `services/social-service`: social graph and content domains.
- `platform`: published shared contracts and packages.
- `frontend/social-web-client`: independent Angular client.

Never commit `.env`, tokens, generated build output, or `node_modules`. Use `.env.example` as the variable contract and GitHub Actions secrets for CI.
